import { Database } from "../database/Database";
import { QuarantineStatus } from "../types/Classifier";
import { Email } from "../types/Email";
import { IAlgorithm } from "./IAlgorithm";

export enum RISK {
    SAFE = 0,
    SUSPECT = 50,
    DANGEROUS = 100,
}

class FromAlgorithm implements IAlgorithm {
    /**
     * This algorithm assigns a risk level with the following precedence:
     * 1. If we've received other emails from this sender, assign incoming email
     *      with the highest risk ever assigned to other emails from the same sender
     * 2. If we've received emails from another sender with the same display name
     *      AND a different email, assign this email as high risk
     * 3. If we've never seen emails from this sender, assign this email as
     *      medium risk.
     * @param e Email
     * @returns number
     */
    async getRiskScore(e: Email): Promise<number> {

        const db: Database = new Database()
        let query: string;
        let response: any;
        let fromAddressDisplayName: string;

        const fromAddressID = e.fromAddressID

        //
        // Retrieve sender Display Name of incoming email
        //
        query = this.getSenderDisplayName(fromAddressID.id)

        response = await db.query(query)
        fromAddressDisplayName = response.rows[0]

        //
        // Check: If we've received other emails from Sender in past
        //
        query = this.getOtherEmailsFromSender(e)
        response = (await db.query(query)).rows
        if (Number(response[0])) {
            //
            // Assign: Highest level of risk we've ever assigned their emails
            //
            query = this.getClassifierResultSendersOtherEmails(e)
            response = (await db.query(query))?.rows[0]
            if (response.includes(QuarantineStatus.DENIED)) {
                return RISK.DANGEROUS
            } else if (response.includes(QuarantineStatus.ALLOWED)) {
                return RISK.SAFE
            } else {
                return RISK.SUSPECT
            }
        }
        //
        // Else: We have not received other emails from Sender in past
        //
        else {
            // 
            // Check: If DisplayName has been seen before, and mark DANGEROUS if so
            // 
            query = this.getEmailAddressesWithSameDisplayNameButDifferentEmailAddress(e, fromAddressDisplayName)
            response = (await db.query(query)).rows[0]
            if (Number(response)) {
                return RISK.DANGEROUS
            }
            //
            // Else: Mark as SUSPECT
            //
            else {
                return RISK.SUSPECT
            }
        }
    }

    /**
     * Query checks whether we've received emails in the past from someone else with the same display name 
     * @param e 
     * @param fromAddressDisplayName 
     * @returns string
     */
    private getEmailAddressesWithSameDisplayNameButDifferentEmailAddress(e: Email, fromAddressDisplayName: string): string {
        return `
                select count(*) from EmailAddresses where
                id != '${e.fromAddressID.id}' and 
                displayName = '${fromAddressDisplayName}'
            ;`;
    }

    /**
     * Query gets the classifierResult of other emails from the same sender
     * @param e 
     * @returns string 
     */
    private getClassifierResultSendersOtherEmails(e: Email): string {
        return `
                select Emails.quarantinestatus from Emails 
                inner join EmailAddresses 
                    on Emails.fromAddressId = EmailAddresses.ID
                where Emails.fromAddressId='${e.fromAddressID.id}'
                    and Emails.id != '${e.id}'
                group by Emails.quarantinestatus
            ;`;
    }

    /**
     * Query counts the number of other emails received from this sender
     * @param e 
     * @returns string 
     */
    private getOtherEmailsFromSender(e: Email): string {
        return `
            select count(*) from Emails, EmailAddresses where
            EmailAddresses.id = '${e.fromAddressID.id}' and
            Emails.fromAddressId = EmailAddresses.id and
            Emails.id != '${e.id}'
        ;`;
    }

    /**
     * Query gets the display name of sender of current email
     * @param fromAddressID 
     * @returns string 
     */
    private getSenderDisplayName(fromAddressID: string): string {
        return `
            select displayname from emailaddresses where
            id='${fromAddressID}'
        ;`;
    }
}

export default FromAlgorithm