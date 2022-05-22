import { Attachment, Email } from '../../src/types/Email';
import { EmailAddress } from '../../src/types/EmailAddress';
import { ContentType } from '../../src/types/MIME';
import { ClassifierResult, QuarantineStatus } from '../../src/types/Classifier';
import Random from './Random';
import EmailHeadersFactory from './EmailHeadersFactory';
import EmailBodyFactory from './EmailBodyFactory';
import EmailAttachmentsFactory from './EmailAttachmentsFactory';
import EmailAddressFactory from './EmailAddressFactory';

export default class EmailFactory implements Email {
  id: string;
  fromAddressID: EmailAddress;
  toAddressID: EmailAddress;
  receivedTimestamp: Date;
  classifiedTimestamp: Date;
  reviewedTimestamp: Date;
  contentType: ContentType;
  headers: Map<string, any>;
  body: string;
  classifierResult?: ClassifierResult;
  quarantineStatus: QuarantineStatus;
  attachments: Attachment[];
  rawEmail: string;
  emailSubject: string;

  public constructor() {
    const random = new Random();

    this.id = random.id();
    this.fromAddressID = new EmailAddressFactory().getEmailAddress();
    this.toAddressID = new EmailAddressFactory().getEmailAddress();
    this.receivedTimestamp = random.date();
    this.classifiedTimestamp = random.date();
    this.reviewedTimestamp = random.date();
    this.contentType = random.contentType();
    this.headers = new EmailHeadersFactory().getHeaders();
    this.body = new EmailBodyFactory(random.text()).withTextPlain(random.text()).getBody();
    this.classifierResult = undefined;
    this.quarantineStatus = random.quarantineStatus();
    this.attachments = new EmailAttachmentsFactory().getAttachments();
    this.rawEmail = random.text();
    this.emailSubject = random.text();
  }

  public withId(id: string) {
    this.id = id;
    return this;
  }

  public withFromAddressId(fromAddressID: EmailAddress) {
    this.fromAddressID = fromAddressID;
    return this;
  }

  public withToAddressId(toAddressID: EmailAddress) {
    this.toAddressID = toAddressID;
    return this;
  }

  public withReceivedTimestamp(receivedTimestamp: Date) {
    this.receivedTimestamp = receivedTimestamp;
    return this;
  }

  public withClassifiedTimestamp(classifiedTimestamp: Date) {
    this.classifiedTimestamp = classifiedTimestamp;
    return this;
  }

  public withReviewedTimestamp(reviewedTimestamp: Date) {
    this.reviewedTimestamp = reviewedTimestamp;
    return this;
  }

  public withContentType(contentType: ContentType) {
    this.contentType = contentType;
    return this;
  }

  public withHeaders(headers: Map<string, any>) {
    this.headers = headers;
    return this;
  }

  public withBody(body: string) {
    this.body = body;
    return this;
  }

  public withClassifierResult(classifierResult: ClassifierResult) {
    this.classifierResult = classifierResult;
    return this;
  }

  public withQuarantineStatus(quarantineStatus: QuarantineStatus) {
    this.quarantineStatus = quarantineStatus;
    return this;
  }

  public withAttachments(attachments: Attachment[]) {
    this.attachments = attachments;
    return this;
  }

  public withRawEmail(rawEmail: string) {
    this.rawEmail = rawEmail;
    return this;
  }
  
  public withSubject(emailSubject: string) {
    this.emailSubject = emailSubject;
    return this;
  }

  public getEmail(): Email {
    return {
      id: this.id,
      fromAddressID: this.fromAddressID,
      toAddressID: this.toAddressID,
      receivedTimestamp: this.receivedTimestamp,
      classifiedTimestamp: this.classifiedTimestamp,
      reviewedTimestamp: this.reviewedTimestamp,
      contentType: this.contentType,
      headers: this.headers,
      body: this.body,
      classifierResult: this.classifierResult,
      quarantineStatus: this.quarantineStatus,
      attachments: this.attachments,
      rawEmail: this.rawEmail
    };
  }
}
