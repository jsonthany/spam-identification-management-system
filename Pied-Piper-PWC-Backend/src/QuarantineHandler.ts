import { EmailManager } from "./EmailManager";
import { Email as Email_fromTypes } from './types/Email';
import { ClassifierResult, QuarantineStatus } from './types/Classifier';
import { Database } from "./database/Database";

const SqlString = require('sqlstring');
export class QuarantineHandler {
    static DB: Database = new Database()

    /**
     * Adds new QUARANTINE Email to DB
     * 
     * @param e QUARANTINE Email from Classifier
     * @param res: ClassifierResult of this email
     */
    static async addEmailToDatabase(e: Email_fromTypes, res: ClassifierResult): Promise<void> {
        // Add X-CMA-ID header to headers and rawEmail
        e.headers.set('x-cma-id', e.id);

        let rawEmail: string = ""
        if (e.rawEmail) {
            e.rawEmail = `X-CMA-ID: ${e.id}\r\n` + e.rawEmail;
            rawEmail = SqlString.escape(e.rawEmail)
            rawEmail = rawEmail.substring(1, rawEmail.length - 1).replace(/\'/g, "''")
        }

        let body: string = ""
        if (e.body) {
            body = SqlString.escape(e.body)
            body = body.substring(1, body.length - 1).replace(/\'/g, "''")
        }

        let query: string = `
            insert into 
                emails(
                    id,
                    fromAddressID,
                    toAddressID,
                    receivedTimestamp,
                    classifiedTimestamp,
                    reviewedTimestamp,
                    contentType,
                    fullHeaders,
                    emailBody,
                    classifierResult,
                    quarantineStatus,
                    rawEmail
                )
                values(
                    '${e.id}',
                    '${e.fromAddressID.id}',
                    '${e.toAddressID?.id}',
                    '${e.receivedTimestamp.toISOString()}',
                    ${e.classifiedTimestamp?.toISOString() ? "'" + e.classifiedTimestamp?.toISOString() + "'" : 'null'},
                    ${e.reviewedTimestamp?.toISOString() ? "'" + e.reviewedTimestamp?.toISOString() + "'" : 'null'},
                    '${e.contentType}',
                    '${JSON.stringify(e.headers)}',
                    '${body}',
                    '${JSON.stringify(res)}',
                    '${e.quarantineStatus}',
                    '${rawEmail}'

                )
        ;`
        try {
            await this.DB.query(query)
        } catch (err) {
            throw err
        }

    }

    async getQuarantineEmailIdList(): Promise<string[]> {
        let query: string = `
            select id from emails where quarantineStatus = 'PENDING' or quarantineStatus = 'DENIED'
        ;`
        let result;
        try {
            result = await QuarantineHandler.DB.query(query)
            let resultRows: string[] = []
            result.rows.forEach(v => { resultRows.push(String(v[0])) })

            return Promise.resolve(resultRows)
        } catch (error: any) {
            return Promise.reject(new Error(error))
        }
    }

    /**
     * Returns the full Email object fetched from DB
     * 
     * @param id string id of the email
     * @returns raw email with corresponding id
     */
    async getQuarantineEmail(id: string): Promise<string> {
        let query: string = `
            select emailBody from emails where id = '${id}'
        ;`
        let result: any
        try {
            result = await QuarantineHandler.DB.query(query)

            return Promise.resolve(result.rows[0][0]);
        } catch (error: any) {
            return Promise.reject(new Error(error))
        }
    }

    /**
     * Sends the QUARANTINE email back to Classifier and removes it from QH's DB
     * 
     * @param id uid
     */
    async unquarantineEmail(id: string): Promise<void> {
        const quarantineStatus: QuarantineStatus = QuarantineStatus.ALLOWED

        // Get email
        try {
            const query = `
                select rawEmail, toAddressId from emails where id = '${id}'
            `;
            const res = await QuarantineHandler.DB.query(query);
            let rawEmail = res.rows[0][0]?.toString() ?? '';
            // Unescape backslash-escaped chars
            try {
                rawEmail = JSON.parse(`"${rawEmail}"`);
            } catch (error) {
                console.log('Failed to unescape rawEmail from database');
            }
            // Replace Message-ID to prevent Exchange from rejecting duplicate email
            rawEmail = rawEmail.replace(/(?<=Message-ID:).*?\r\n/, ` <CMA:ALLOWED:${id}:${Date.now()}>\r\n`);
            const toAddressId = res.rows[0][1]?.toString() ?? '';
            // let emailId: string = "email.id"
            await EmailManager.changeQuarantineStatus(id, quarantineStatus, rawEmail, toAddressId);
            return Promise.resolve()
        } catch (error) {
            return Promise.reject(error)
        }
    }

    /**
     * Deletes the QUARANTINE email entry from DB
     * 
     * @param id uid
     */
    async deleteEmail(id: string): Promise<void> {
        let query: string = `
            delete from emails where id = '${id}'
        ;`
        let result: any
        try {
            result = await QuarantineHandler.DB.query(query)
            return Promise.resolve();
        } catch (error: any) {
            return Promise.reject(new Error(error))
        }
    }
}
