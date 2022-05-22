import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import express from 'express';
import EmailsRouter from '../../src/routes/emails';
import { Router } from 'express';
import { config } from 'dotenv';
import { Database } from '../../src/database/Database';
import { Email as EmailRoutes } from '../../src/routes/emails/[id]';
import { Email as EmailTypes } from '../../src/types/Email';
import { Classification, QuarantineStatus } from '../../src/types/Classifier';
import { EmailAddress } from '../../src/types/EmailAddress';
import EmailAddressFactory from '../factories/EmailAddressFactory';
import EmailFactory from '../factories/EmailFactory';
import { randomInt } from 'crypto';
const request = require('supertest');
const app = express()
const bodyParser = require('body-parser');
app.use(bodyParser.json())

config()  // Read .env file


const BaseRouter = Router()
app.use(BaseRouter)
BaseRouter.use('/emails', EmailsRouter)


chai.use(chaiAsPromised); // Bind chai-as-promised extension

describe('GET /emails', () => {
    const db = new Database()

    before(async () => {
        await db.query("insert into emailaddresses values('efgh', 'bob nobody', 'bob', 'nobody.com');")
        await db.query("insert into emailaddresses values('ijkl', 'charlie nobody', 'charlie', 'nobody.com');")
        await db.query(`insert into
            emails(id, fromAddressId, toaddressid, receivedTimestamp, classifiedTimestamp, reviewedTimestamp) 
            values('abcd','efgh','ijkl', '2022-03-23', '2022-03-23', '2022-03-23');`)
    });

    after(async () => {
        await db.query("delete from emails where id='abcd'")
        await db.query("delete from emailaddresses where domain='nobody.com'")
        Database.close()
    })


    it('GET /emails should return emails with appropriate keys', async () => {
        let expected_result =
        {
            id: 'abcd',
            fromAddress: 'bob nobody <bob@nobody.com>',
            toAddress: 'charlie nobody <charlie@nobody.com>',
            receivedTimestamp: 'Tue Mar 22 2022 17:00:00 GMT-0700 (Pacific Daylight Time)',
            classifiedTimestamp: 'Tue Mar 22 2022 17:00:00 GMT-0700 (Pacific Daylight Time)',
            reviewedTimestamp: 'Tue Mar 22 2022 17:00:00 GMT-0700 (Pacific Daylight Time)',
            classifierResult: { classification: 'QUARANTINE' },
            quarantineStatus: 'PENDING',
            emailBody: '',
            emailSubject: '',
            rawEmail: ''
        }
        let expected_keys = Object.keys(expected_result)

        /**
         * Supertest performs a GET request to /emails.
         * Expects: 200 status code and the body to equal expected_result
         */
        var req = await request(app)
            .get('/emails')
            .expect(200)
        let result: any = JSON.parse(req.text).data[0]
        let keys: string[] = Object.keys(result)
        expect(keys).deep.equals(expected_keys)

    });

    it('should accept query params', async () => {
        /**
         * Note: The following query params tests are not comprehensive. I am forgoing
         * spending additional effort on query param unit tests to focus on other parts 
         * of the application. 
         */

        let pageSize = randomInt(1,5)
        let query: any = {
            pageSize: String(pageSize),
            page: '',
            orderBy: '',
            order: 'asc',
        }
        var req = await request(app)
            .get('/emails')
            .query(query)
            .expect(200)
        let result: any = JSON.parse(req.text)
        expect(result.data.length).is.lessThanOrEqual(pageSize)
    })

});

describe('PATCH /emails', () => {
    var mockEmail_1: EmailTypes
    var mockEmail_2: EmailTypes
    var mockEmailAddress: EmailAddress
    var db: Database = new Database()

    before(async () => {
        mockEmailAddress = new EmailAddressFactory()
        mockEmail_1 = new EmailFactory()
            .withFromAddressId(mockEmailAddress)
            .withToAddressId(mockEmailAddress)
            .withClassifierResult({
                classification: Classification.QUARANTINE,
                riskScore: -1
            })
            .withQuarantineStatus(QuarantineStatus.PENDING)
        mockEmail_2 = new EmailFactory()
            .withFromAddressId(mockEmailAddress)
            .withToAddressId(mockEmailAddress)
            .withClassifierResult({
                classification: Classification.QUARANTINE,
                riskScore: -1
            })
            .withQuarantineStatus(QuarantineStatus.PENDING)

        try {
            let query: string = `
                insert into emailaddresses(id, displayName, username, domain)
                values('${mockEmailAddress.id}', '${mockEmailAddress.displayName}', '${mockEmailAddress.username}', '${mockEmailAddress.domain}');
            ;`
            await db.query(query);

            /** Insert mockEmail_1 and mockEmail_2 into Emails table */
            await insertEmails_helper(mockEmail_1, db);
            await insertEmails_helper(mockEmail_2, db);

        } catch (error) {
            throw error
        }
    })

    after(async () => {
        try {
            var query: string = `
                delete from emails where 
                    id = '${mockEmail_1.id}' or
                    id = '${mockEmail_2.id}'    
                ;
            `
            await db.query(query)

            query = `
                delete from emailaddresses where id = '${mockEmailAddress.id}';
            `
            await db.query(query)

        } catch (error) {
            throw error;
        } finally {
            Database.close()
        }
    })

    it('should unquarantine (i.e., allow) multiple emails', async () => {
        let req: any
        let result: any

        let reqBody: Array<Partial<EmailRoutes>> =
            [
                {
                    "id": mockEmail_1.id,
                    "quarantineStatus": QuarantineStatus.ALLOWED
                },
                {
                    "id": mockEmail_2.id,
                    "quarantineStatus": QuarantineStatus.ALLOWED
                }
            ]

        /** Make PATCH request */
        req = await request(app)
            .patch(`/emails`)
            .type('json')
            .send(reqBody)
            .expect(200)

        /** Make GET request on mockEmail_1 */
        req = await request(app)
            .get(`/emails/${mockEmail_1.id}`)
            .expect(200)
        result = JSON.parse(req.text)

        /** Assert that result of GET equals newly modified email */
        expect(result["quarantineStatus"]).equals(QuarantineStatus.ALLOWED)

        /** Make GET request on mockEmail_2 */
        req = await request(app)
            .get(`/emails/${mockEmail_2.id}`)
            .expect(200)
        result = JSON.parse(req.text)

        /** Assert that result of GET equals newly modified email */
        expect(result["quarantineStatus"]).equals(QuarantineStatus.ALLOWED)
    })
})

/** Helper functions */
async function insertEmails_helper(mockEmail: EmailTypes, db: Database) {
    let query = `
                insert into emails(
                    id,
                    fromAddressID,
                    toAddressID,
                    receivedTimestamp,
                    classifiedTimestamp,
                    reviewedTimestamp,
                    contentType,
                    emailBody,
                    classifierResult,
                    quarantineStatus,
                    rawEmail
                ) values(
                    '${mockEmail.id}',
                    '${mockEmail.fromAddressID.id}',
                    '${mockEmail.toAddressID?.id}',
                    '${mockEmail.receivedTimestamp.toISOString()}',
                    '${mockEmail.classifiedTimestamp?.toISOString()}',
                    '${mockEmail.reviewedTimestamp?.toISOString()}',
                    '${mockEmail.contentType}',
                    '${mockEmail.body}',
                    '${JSON.stringify(mockEmail.classifierResult)}',
                    '${mockEmail.quarantineStatus}',
                    '${mockEmail.rawEmail}'
                );
            `;
    await db.query(query);
}

