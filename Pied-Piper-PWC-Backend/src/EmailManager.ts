import { Email } from './types/Email';
import { Classification, ClassifierResult, QuarantineStatus } from './types/Classifier';
import { Classifier } from './Classifier';
import { QuarantineHandler } from './QuarantineHandler';
import { EmailServerConnector } from './EmailServerConnector';
import { Database } from './database/Database';
import { EmailAddress } from './types/EmailAddress';

export class EmailManager {
  private static db: Database = new Database();
  // NOTE: we either have some sort of class management, i.e. linking objs like EmailManager and QuarantineHandler somehow,
  //       or make everything static? im ok with both, making them static seems easier and for this backend we probably wont
  //       need multiple instances of each class anyway?

  /**
   * Takes in emails from the EmailServerConnector, handles the rest of
   * classification, and sends it to proper places depending on the classification
   *
   * @param e email needed to be handled
   */
  static async handleEmail(e: Email): Promise<ClassifierResult> {
    const allowedClassifierResult = await this.getAllowedClassifierResult(e);
    if (allowedClassifierResult) {
      console.log("Email is SAFE (REASON: Previously allowed by admin)");
      // Override classification to let email through and stop further processing
      return {
        classification: Classification.SAFE,
        riskScore: allowedClassifierResult.riskScore,
      };
    }

    this.updateReceiverAndSenderEmailAddressList(e);

    // calls algorithm to get a ClassifierResult, including a class and a risk score
    let res: ClassifierResult = await Classifier.classifyEmail(e);
    const classification = res.classification;

    e.classifiedTimestamp = new Date()

    if (res.classification === Classification.QUARANTINE) {
      e.quarantineStatus = QuarantineStatus.PENDING;
    }

    // Commit email to database
    QuarantineHandler.addEmailToDatabase(e, res);

    // return the ClassifierResult to EmailServerConnector to be furthur process
    return res;
  }

  static async getAllowedClassifierResult(e: Email): Promise<ClassifierResult | null> {
    const headerEmailId = e.headers.get('x-cma-id'); // Parsed headers are lowercase
    if (typeof headerEmailId !== 'string') {
      return null;
    }
    const fromAddress = `${e.fromAddressID.username}@${e.fromAddressID.domain}`;
    const toAddress = e.toAddressID ? `${e.toAddressID.username}@${e.toAddressID.domain}` : undefined;
    const query = `
      select 
        emails.id,
        emails.quarantineStatus,
        concat(ea1.username, '@', ea1.domain),
        concat(ea2.username, '@', ea2.domain)
      from emails, emailaddresses ea1, emailaddresses ea2
      where
        emails.id = '${headerEmailId}' and
        emails.fromaddressid = ea1.id and
        emails.toaddressid = ea2.id
    `;
    const result = await new Database().query(query);
    for (const v of result.rows) {
      const isSameId = headerEmailId === v[0]?.toString();
      const isAllowed = v[1]?.toString() === QuarantineStatus.ALLOWED;
      const isSameFromAddress = fromAddress === v[2]?.toString();
      const isSameToAddress = toAddress ? toAddress === v[3]?.toString() : true;
      if (isSameId && isAllowed && isSameFromAddress && isSameToAddress) {
        return {
          classification: Classification.SAFE,
          riskScore: -1
        };
      }
    }
    return null;
  }

  static updateReceiverAndSenderEmailAddressList(e: Email): void {
    const receiver: EmailAddress | undefined = e.toAddressID;
    const sender: EmailAddress = e.fromAddressID;

    // update db
    if (receiver) {
      const receiverQuery: string = this.makeInsertEmailAddressQuery(receiver);
      this.db.query(receiverQuery);
    }
    const senderQuery: string = this.makeInsertEmailAddressQuery(sender);

    this.db.query(senderQuery);
  }

  static makeInsertEmailAddressQuery(receiver: EmailAddress): string {
    let tup = `('${receiver.id}', '${receiver.username}', '${receiver.domain}', '${receiver.displayName}')`
    return `
      insert into emailaddresses(id, username, domain, displayName) values ${tup} 
        ON CONFLICT (id) DO UPDATE SET 
          displayname = '${receiver.displayName}';`
  }

  /**
   * Changes the QuarantineStatus of an email
   * @param emailID 
   * @param newQuarantineStatus 
   */
  static async changeQuarantineStatus(emailID: string, newQuarantineStatus: QuarantineStatus, rawEmail: string, toAddressId: string): Promise<void> {
    let query: string = `
      update emails set
        quarantineStatus = '${newQuarantineStatus}'
      where
        id = '${emailID}'
    ;`

    try {
      this.db.query(query)

      // Send raw email back to Exchange server if query succeeds
      try {
        await EmailServerConnector.sendToServer(rawEmail, toAddressId);   
      } catch (error) {
        // Do not verify that email has been received by the exchange server
      }
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
