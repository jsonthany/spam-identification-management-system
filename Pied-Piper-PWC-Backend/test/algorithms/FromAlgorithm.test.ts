import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Email } from '../../src/types/Email';
import { EmailAddress } from '../../src/types/EmailAddress';
import { Classification, QuarantineStatus } from '../../src/types/Classifier';
import EmailAddressFactory from '../factories/EmailAddressFactory';
import EmailFactory from '../factories/EmailFactory';
import EmailHeadersFactory from '../factories/EmailHeadersFactory';
import FromAlgorithm, { RISK } from '../../src/algorithm_modules/FromAlgorithm';
import { Database } from '../../src/database/Database';

chai.use(chaiAsPromised); // Bind chai-as-promised extension

describe('FromAlgorithm Tests', () => {

  let toEmailAddress: EmailAddress
  let fromEmailAddress: EmailAddress
  let fromFakeEmailAddress: EmailAddress
  let safeEmail: Email;
  let fakeEmail: Email;
  let algo = new FromAlgorithm();
  let fromDisplayName = "Steve Jobs Ghost"
  let toDisplayName = "Tim Cook"
  let body = "FromAlgorithm Test"

  before(async () => {
    toEmailAddress = new EmailAddressFactory()
      .withDisplayName(toDisplayName)
      .withUsername('Tim.Cook')
      .withDomain('apple.com')
      .getEmailAddress();

    fromEmailAddress = new EmailAddressFactory()
      .withDisplayName(fromDisplayName)
      .withUsername('Steve.Jobs')
      .withDomain('apple.com')
      .getEmailAddress();

    fromFakeEmailAddress = new EmailAddressFactory()
      .withDisplayName(fromDisplayName)
      .withUsername('Steve.Jobs')
      .withDomain('clearly-fake.com')
      .getEmailAddress();

    safeEmail = new EmailFactory()
      .withToAddressId(toEmailAddress)
      .withFromAddressId(fromEmailAddress)
      .withHeaders(new EmailHeadersFactory().withDate(new Date('2022-02-22')).withFrom('me@hello.com').getHeaders())
      .withClassifierResult({
        classification: Classification.SAFE,
        riskScore: -1,
      })
      .withQuarantineStatus(QuarantineStatus.ALLOWED)
      .withBody(body)
      .getEmail();

    fakeEmail = new EmailFactory()
      .withToAddressId(toEmailAddress)
      .withFromAddressId(fromFakeEmailAddress)
      .withHeaders(new EmailHeadersFactory().withDate(new Date('2022-02-22')).withFrom('me@hello.com').getHeaders())
      .withBody(body)
      .withQuarantineStatus(QuarantineStatus.DENIED)
      .getEmail();

    let tup, query, db

    // Insert fromEmailAddress
    tup = `('${fromEmailAddress.id}', '${fromEmailAddress.username}', '${fromEmailAddress.domain}', '${fromEmailAddress.displayName}')`
    query = `insert into emailaddresses(id, username, domain, displayName) values ${tup};`
    db = new Database()
    await db.query(query)

    // Insert toEmailAddress
    tup = `('${toEmailAddress.id}', '${toEmailAddress.username}', '${toEmailAddress.domain}', '${toEmailAddress.displayName}')`
    query = `insert into emailaddresses(id, username, domain, displayName) values ${tup};`
    db = new Database()
    await db.query(query)

    // Insert Safe Email
    tup = `('${safeEmail.id}','${fromEmailAddress.id}', '${toEmailAddress.id}', '${safeEmail.quarantineStatus}', '${safeEmail.body}')`
    query = `insert into emails(id, fromAddressID, toAddressID, quarantinestatus, emailBody) values ${tup};`
    await db.query(query)
  });

  after(async () => {
    let db = new Database()
    let query

    query = `delete from emails where (emailBody = '${body}');`
    await db.query(query)

    query = `delete from emailaddresses where (domain='apple.com' or domain='clearly-fake.com');`
    await db.query(query)
    Database.close()
  })

  it('Should flag email address never seen before from new senders as "SUSPECT"', async () => {
    let tup, query, db, suspectEmailAddress, suspectEmail

    suspectEmailAddress = new EmailAddressFactory()
      .withDisplayName("Johnny Ive")
      .withUsername('Johnny.Ive')
      .withDomain('apple.com')
      .getEmailAddress();

    suspectEmail = new EmailFactory()
      .withToAddressId(toEmailAddress)
      .withFromAddressId(suspectEmailAddress)
      .withHeaders(new EmailHeadersFactory().withDate(new Date('2022-02-22')).withFrom('me@hello.com').getHeaders())
      .withBody(body)
      .getEmail();

    // Insert suspectEmailAddress
    tup = `('${suspectEmailAddress.id}', '${suspectEmailAddress.username}', '${suspectEmailAddress.domain}', '${suspectEmailAddress.displayName}')`
    query = `insert into emailaddresses(id, username, domain, displayName) values ${tup};`
    db = new Database()
    await db.query(query)

    // Insert Suspect Email
    tup = `('${suspectEmail.id}','${suspectEmailAddress.id}', '${toEmailAddress.id}', '${suspectEmail.quarantineStatus}', '${suspectEmail.body}')`
    query = `insert into emails(id, fromAddressID, toAddressID, quarantinestatus, emailBody) values ${tup};`
    await db.query(query)

    let riskScore: number = await algo.getRiskScore(suspectEmail)
    expect(riskScore).to.equal(RISK.SUSPECT);
  });

  it('Should flag email address with bad domain as "DANGEROUS"', async () => {
    let tup, query, db

    // Insert fromFakeEmailAddress
    tup = `('${fromFakeEmailAddress.id}', '${fromFakeEmailAddress.username}', '${fromFakeEmailAddress.domain}', '${fromFakeEmailAddress.displayName}')`
    query = `insert into emailaddresses(id, username, domain, displayName) values ${tup};`
    db = new Database()
    await db.query(query)

    // Insert Dangerous Email
    tup = `('${fakeEmail.id}','${fromFakeEmailAddress.id}', '${toEmailAddress.id}', '${fakeEmail.classifierResult?.classification}', '${fakeEmail.body}')`
    query = `insert into emails(id, fromAddressID, toAddressID, classifierResult, emailBody) values ${tup};`
    await db.query(query)

    let riskScore: number = await algo.getRiskScore(fakeEmail)
    expect(riskScore).to.equal(RISK.DANGEROUS);
  });

  it('Should flag email address we\'ve seen before as "SAFE', async () => {
    let safeEmail_1: Email = new EmailFactory()
      .withToAddressId(toEmailAddress)
      .withFromAddressId(fromEmailAddress)
    let riskScore = await algo.getRiskScore(safeEmail_1)
    expect(riskScore).equals(RISK.SAFE)
  })

});
