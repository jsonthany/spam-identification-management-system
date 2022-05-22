import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { config } from 'dotenv';
import express, { Router } from 'express';
import { Database } from '../../../src/database/Database';
import { QuarantineHandler } from '../../../src/QuarantineHandler';
import EmailsRouter from '../../../src/routes/emails';
import { Classification, ClassifierResult, QuarantineStatus } from '../../../src/types/Classifier';
import { Email } from '../../../src/types/Email';
import { EmailAddress } from '../../../src/types/EmailAddress';
import EmailAddressFactory from '../../factories/EmailAddressFactory';
import EmailFactory from '../../factories/EmailFactory';
import EmailHeadersFactory from '../../factories/EmailHeadersFactory';
import Random from '../../factories/Random';
const request = require('supertest');
const app = express()

config()  // Read .env file


const BaseRouter = Router()
app.use(BaseRouter)
BaseRouter.use('/emails', EmailsRouter)

chai.use(chaiAsPromised); // Bind chai-as-promised extension

describe('Requests on /emails/:id', () => {

    /** Variables */
    var mockEmail_1: Email
    var mockEmail_2: Email
    var mockEmailAddress: EmailAddress
    var mockEmailId_1: string
    var mockEmailId_2: string
    var mockEmailAddressId: string
    var mockEmailBody: string
    var db: Database = new Database()

    /** Generate mock email and email address */
    before(async () => {
        let classifierResult_quarantine: ClassifierResult = {
            classification: Classification.QUARANTINE,
            riskScore: -1
        }

        mockEmailAddress = new EmailAddressFactory()
            .withUsername('steve.jobs')
            .withDomain('appel.com')
            .getEmailAddress();

        mockEmail_1 = new EmailFactory()
            .withToAddressId(mockEmailAddress)
            .withFromAddressId(mockEmailAddress)
            .withHeaders(new EmailHeadersFactory().withDate(new Date('2022-02-22')).withFrom('me@hello.com').getHeaders())
            .withReceivedTimestamp(new Date())
            .withClassifiedTimestamp(new Date(Date.now() + 60000))  // Time + 60 seconds
            .withBody(new Random().text())
            .withClassifierResult(classifierResult_quarantine)
            .withQuarantineStatus(QuarantineStatus.PENDING)
            .getEmail();

        mockEmail_2 = new EmailFactory()
            .withToAddressId(mockEmailAddress)
            .withFromAddressId(mockEmailAddress)
            .withHeaders(new EmailHeadersFactory().withDate(new Date('2022-02-22')).withFrom('me@hello.com').getHeaders())
            .withReceivedTimestamp(new Date())
            .withClassifiedTimestamp(new Date(Date.now() + 60000))  // Time + 60 seconds
            .withBody(new Random().text())
            .withClassifierResult(classifierResult_quarantine)
            .getEmail();

        mockEmailId_1 = mockEmail_1.id
        mockEmailId_2 = mockEmail_2.id
        mockEmailAddressId = mockEmailAddress.id
        mockEmailBody = mockEmail_1.body

        let query: string = `
            insert into emailaddresses(id, displayName, username, domain)
            values('${mockEmailAddress.id}', '${mockEmailAddress.displayName}', '${mockEmailAddress.username}', '${mockEmailAddress.domain}')
        ;`
        await db.query(query)

        /** Add mock email to database */
        await QuarantineHandler.addEmailToDatabase(mockEmail_1, mockEmail_1.classifierResult || classifierResult_quarantine)
        await QuarantineHandler.addEmailToDatabase(mockEmail_2, mockEmail_2.classifierResult || classifierResult_quarantine)
    });

    /** Clean up EmailAddresses and close Database connection after all tests */
    after(async () => {
        await db.query(`
            delete from emails where 
                id='${mockEmailId_1}' or
                id='${mockEmailId_2}'
        ;`)

        let query: string = `
            delete from emailaddresses where id = '${mockEmailAddress.id}'
        ;`
        await db.query(query)

        Database.close()
    })


    it('GET /emails/:id should return correct email result', async () => {
        let req = await request(app)
            .get(`/emails/${mockEmailId_1}`)
            .expect(200)
        let result: any = JSON.parse(req.text)

        expect(result.id).equals(mockEmail_1.id)
        expect(result.quarantineStatus).equals(mockEmail_1.quarantineStatus)
    })

    it('DELETE /emails/:id should delete email', async () => {
        /** Validate result exists in database */
        let db = new Database()
        let req = await db.query(`
            select count(*) from emails where id='${mockEmailId_2}'
        ;`)
        expect(Number(req.rows[0])).equals(1)

        req = await request(app)
            .delete(`/emails/${mockEmailId_2}`)
            .expect(200)

        /** Ensure result no longer exists in DB */
        req = await db.query(`
            select count(*) from emails where id='${mockEmailId_2}'
        ;`)

        expect(Number(req.rows[0])).equals(0)
    })
})