import { EmailManager } from "./EmailManager";
import { Attachment, Email } from './types/Email';
import { ClassifierResult } from './types/Classifier';
import nodemailer from 'nodemailer';
import { EmailAddress } from "./types/EmailAddress";
import Random from "../test/factories/Random";
import { AnalyzeResBody } from "./routes/analyze";
const simpleParser = require('mailparser').simpleParser;

export class EmailServerConnector {

    /**
     * Receives an raw email string from the email server, parses it into Email obj,
     * sends it to Classifier, then sends the result to analyze.ts
     * @param rawEmail assume the input email is a full string of an orginal email
     * @returns see AnalyzeResBody
     */
    static async handleEmail(rawEmail: string): Promise<AnalyzeResBody> {
        const email: Email = await this.parseRawEmail(rawEmail);

        const result: ClassifierResult = await EmailManager.handleEmail(email);

        let analyzeResBody: AnalyzeResBody = {
            classifiedTimestamp: email.classifiedTimestamp?.toISOString(),
            emailId: email.id,
            classifierResult: result
        }

        return analyzeResBody;
    }

    /**
     * Parses raw email data from PwC server to an Email object
     * 
     * @param rawEmail: string
     * @returns an Email object with all the information we need to classify, store, and recreate the same email
     */
    static async parseRawEmail(rawEmail: string): Promise<Email> {
        const e: any = await simpleParser(rawEmail);

        // parse attachment (js object) into our Email.Attachment
        const attachments: Attachment[] = this.parseAttachments(e);
        // text body will have a textAsHtml in mailparser
        const body: string = e.textAsHtml ? e.textAsHtml : e.html;

        const fromEmailValue: any = e.from.value[0];
        const fromEmailId: string = fromEmailValue.address;
        const spl: string[] = fromEmailId.split("@", 2);
        const fromAddressId: EmailAddress = {
            id: fromEmailId,
            displayName: fromEmailValue.name,
            username: spl[0],
            domain: spl[1]
        }

        let toEmailValue: any
        // ? why can 'to' be undefined for an email?
        let toAddressId: EmailAddress | undefined;

        try {
            toEmailValue = e.to.value[0];
            const toEmailId: string = toEmailValue.address;
            const spl1: string[] = toEmailId.split("@", 2);
            toAddressId = {
                id: toEmailId,
                displayName: toEmailValue.name,
                username: spl1[0],
                domain: spl1[1]
            }
        } catch (err) {
            toAddressId = undefined
        }


        // ! please distinguish Email obj (what we use in our backend) 
        //                  and mailparser email obj (what nodemailer lib accept)
        let email: Email = {
            id: this.getUniqueId(),
            fromAddressID: fromAddressId,
            toAddressID: toAddressId,
            headers: e.headers,
            body: body,
            attachments: attachments,
            contentType: e.headers.get('content-type')['value'],
            receivedTimestamp: new Date(),
            quarantineStatus: null,
            rawEmail: rawEmail
        };

        return email;
    }

    private static getUniqueId(): string {
        const random = new Random();
        return random.text();
    }

    /**
     * Returns a list of Attachment given mailparser email obj
     * @param e from mailparser
     * @returns a list of Attachment
     */
    public static parseAttachments(e: any): Attachment[] {
        const attachments: Attachment[] = [];

        const raw: any[] = e.attachments;

        for (const r of raw) {
            let type: string = r.contentType;
            // 'image/jpeg' or 'jpeg' => 'jpeg'
            const spl = type.split("/");
            type = spl[1] ? spl[1] : type;

            const newAttachment: Attachment = {
                fileName: r.filename,
                contentType: type,
                size: r.size
            };

            attachments.push(newAttachment);
        }

        return attachments;
    }

    // this is only for un-quarantining emails
    static async sendToServer(rawEmail: string, toAddressId: string): Promise<void> {
        // https://github.com/nodemailer/nodemailer/blob/master/examples/sendmail.js
        // https://nodemailer.com/smtp/

        const transporter = nodemailer.createTransport({
            host: process.env['SMTP_RELAY_HOST'],
            port: Number(process.env['SMTP_RELAY_PORT']),
            secure: false,
            requireTLS: true,
            tls: { rejectUnauthorized: false }, // Allow self-signed certificate
        });

        const message = {
            envelope: {
                to: toAddressId
            },
            raw: rawEmail
        };

        try {
            const info = await transporter.sendMail(message);
            console.log(`Email sent successfully to ${info.envelope.to}`);
        } catch (error) {
            console.log(error);
        }
    }
}
