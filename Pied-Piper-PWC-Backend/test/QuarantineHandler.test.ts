import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Database } from '../src/database/Database';
import { QuarantineHandler } from '../src/QuarantineHandler';
import { Classification, ClassifierResult, QuarantineStatus } from '../src/types/Classifier';
import { Email } from '../src/types/Email';
import { EmailAddress } from '../src/types/EmailAddress';
import EmailAddressFactory from './factories/EmailAddressFactory';
import EmailFactory from './factories/EmailFactory';
import EmailHeadersFactory from './factories/EmailHeadersFactory';
import Random from './factories/Random';

chai.use(chaiAsPromised); // Bind chai-as-promised extension

describe('QuarantineHandler Class', () => {
    /** Constants */
    const QH = new QuarantineHandler()

    /** Variables */
    var mockEmail: Email
    var mockEmailAddress: EmailAddress
    var mockEmailId: string
    var mockEmailAddressId: string
    var mockEmailBody: string

    /** Generate mock email and email address */
    before(() => {
        mockEmailAddress = new EmailAddressFactory()
            .withUsername('steve.jobs')
            .withDomain('appel.com')
            .getEmailAddress();

        mockEmail = new EmailFactory()
            .withToAddressId(mockEmailAddress)
            .withFromAddressId(mockEmailAddress)
            .withHeaders(new EmailHeadersFactory().withDate(new Date('2022-02-22')).withFrom('me@hello.com').getHeaders())
            .withBody(new Random().text())
            .withClassifierResult({
                classification: Classification.QUARANTINE,
                riskScore: -1,
            })
            .withQuarantineStatus(QuarantineStatus.PENDING)
            .getEmail();

        mockEmailId = mockEmail.id
        mockEmailAddressId = mockEmailAddress.id
        mockEmailBody = mockEmail.body
    });

    /** Close Database connection after all tests */
    after(() => {
        Database.close()
    })


    describe('Add quarantine email, retrieve list, and get quarantine email', () => {
        var quarantineEmailIdList_initial: string[]
        var quarantineEmailIdList_after: string[]
        var quarantineEmailIdListSet_initial: Set<string>
        var quarantineEmailIdList_diff: string[]

        before(async () => {
            quarantineEmailIdList_initial = await QH.getQuarantineEmailIdList()
            let classifierResult_quarantine: ClassifierResult = {
                classification: Classification.QUARANTINE,
                riskScore: -1
            }

            /** Add mock email to database */
            await helper_addEmailAddresses([mockEmailAddress])
            await QuarantineHandler.addEmailToDatabase(mockEmail, classifierResult_quarantine)

            quarantineEmailIdList_after = await QH.getQuarantineEmailIdList()
            quarantineEmailIdListSet_initial = new Set(quarantineEmailIdList_initial)

            /** Compute set difference */
            quarantineEmailIdList_diff = quarantineEmailIdList_after.filter((x) =>
                !quarantineEmailIdListSet_initial.has(x)
            )

        })

        /** Clean up mock email from database */
        after(async () => {
            let db = new Database()
            await db.query(`
                delete from emails where id='${mockEmailId}'
            ;`)

            await helper_removeEmailAddresses([mockEmailAddress])
            Database.close()
        })


        it('should add a quarantine email to database and retrieve quarantine email list', async () => {
            expect(quarantineEmailIdList_diff.length).is.equal(1)
            expect(quarantineEmailIdList_diff[0]).is.equal(mockEmailId)
        });

        it('should get appropriate quarantine email', async () => {
            let res: string = await QH.getQuarantineEmail(mockEmailId)
            expect(res).equals(mockEmailBody)
        })
    });


    describe('Unquarantine and delete email', () => {
        var quarantineEmailIdList_initial: string[]
        var quarantineEmailIdList_after: string[]
        var quarantineEmailIdListSet_initial: Set<string>
        var quarantineEmailIdListSet_after: Set<string>

        /** Insert EmailAddresses to Database */
        before(async () => {
            await helper_addEmailAddresses([mockEmailAddress])
        })

        beforeEach(async () => {
            let classifierResult_quarantine: ClassifierResult = {
                classification: Classification.QUARANTINE,
                riskScore: -1
            }

            /** Add mock email to database */
            await QuarantineHandler.addEmailToDatabase(mockEmail, classifierResult_quarantine)

            quarantineEmailIdList_initial = await QH.getQuarantineEmailIdList()
        })

        /** Insert EmailAddresses to Database */
        after(async () => {
            await helper_removeEmailAddresses([mockEmailAddress])
        })

        /** Clean up mock email from database */
        afterEach(async () => {
            let db = new Database()
            await db.query(`
                delete from emails where id='${mockEmailId}'
            ;`)
        })


        it('should unquarantine an email', async () => {
            /** Quarantined email ids list prior to unquarantine should contain mockEmailId */
            quarantineEmailIdListSet_initial = new Set(quarantineEmailIdList_initial)
            expect(quarantineEmailIdListSet_initial.has(mockEmailId)).is.true
            await QH.unquarantineEmail(mockEmailId)

            /** Quarantined email ids list after unquarantine should not contain mockEmailId */
            quarantineEmailIdList_after = await QH.getQuarantineEmailIdList()
            quarantineEmailIdListSet_after = new Set(quarantineEmailIdList_after)
            expect(quarantineEmailIdListSet_after.has(mockEmailId)).is.false
        });

        it('should delete an email from the database', async () => {
            /** Quarantined email ids list prior to deletion should contain mockEmailId */
            quarantineEmailIdListSet_initial = new Set(quarantineEmailIdList_initial)
            expect(quarantineEmailIdListSet_initial.has(mockEmailId)).is.true

            await QH.deleteEmail(mockEmailId)

            /** Quarantined email ids list after deletion should not contain mockEmailId */
            quarantineEmailIdList_after = await QH.getQuarantineEmailIdList()
            quarantineEmailIdListSet_after = new Set(quarantineEmailIdList_after)
            expect(quarantineEmailIdListSet_after.has(mockEmailId)).is.false
        });
    });
});



/** Helper Functions */
async function helper_addEmailAddresses(emailAddresses: EmailAddress[]) {
    // Do nothign if no emailAddresses
    if (emailAddresses.length == 0)
        return

    let db = new Database()
    let stringBuilder: string[] = []
    stringBuilder.push(`
        insert into emailaddresses(
            id,
            displayName,
            username,
            domain
        )
        values(
            '${emailAddresses[0].id}',
            '${emailAddresses[0].displayName}',
            '${emailAddresses[0].username}',
            '${emailAddresses[0].domain}'
    )`)
    emailAddresses.forEach((e, i) => {
        if (i != 0) {
            stringBuilder.push(`, (
                '${e.id}',
                '${e.displayName}',
                '${e.username}',
                '${e.domain}'
            )`)
        }
    })

    stringBuilder.push(' on conflict do nothing;')
    let query: string = stringBuilder.join('')
    await db.query(query)
}

async function helper_removeEmailAddresses(emailAddresses: EmailAddress[]) {
    // Do nothign if no emailAddresses
    if (emailAddresses.length == 0)
        return

    let db = new Database()
    let stringBuilder: string[] = []
    stringBuilder.push(`delete from emailaddresses where id='${emailAddresses[0].id}'`)
    emailAddresses.forEach((e, i) => {
        if (i != 0) {
            stringBuilder.push(` or id='${e.id}'`)
        }
    })

    stringBuilder.push(';')
    let query: string = stringBuilder.join('')
    await db.query(query)

    Database.close()
}