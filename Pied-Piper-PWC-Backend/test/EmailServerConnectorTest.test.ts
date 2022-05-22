import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Attachment } from '../src/types/Email';
import { EmailServerConnector } from '../src/EmailServerConnector';
import { QuarantineStatus } from '../src/types/Classifier';
import { EmailAddress } from '../src/types/EmailAddress';
import { Database } from '../src/database/Database';
const fs = require('fs');

chai.use(chaiAsPromised); // Bind chai-as-promised extension

describe('EmailServerConnector test', () => {

  describe('parseEmail should produce correct Email obj', () => {
    const EMAIL_WITH_JPG_ATTACHMENT = '/sample_emails/email_with_jpg_attachment.eml';
    const EMAIL_WITH_EXE_ATTACHMENT = '/sample_emails/email_with_exe_attachment.eml';
    const EMAIL_WITH_EMBEDDED_IMAGE_AND_JPG_ATTACHMENT = '/sample_emails/email_with_embedded_image_and_jpg_attachment.eml';


    it('can parse email', async () => {
      let rawEmail: string = fs.createReadStream(__dirname + EMAIL_WITH_EMBEDDED_IMAGE_AND_JPG_ATTACHMENT);
      const mail = await EmailServerConnector.parseRawEmail(rawEmail);

      const fromAddressID: EmailAddress = mail.fromAddressID;
      expect(fromAddressID.displayName).to.equal('YB Zhao');
      expect(fromAddressID.username).to.equal('ybzhao.p3k');
      expect(fromAddressID.domain).to.equal('gmail.com');

      const toAddressID: EmailAddress | undefined = mail.toAddressID;
      if (toAddressID) {
        expect(toAddressID.displayName).to.equal('');
        expect(toAddressID.username).to.equal('hall.jerry9');
        expect(toAddressID.domain).to.equal('gmail.com');
      }

      const headers = mail.headers;
      expect(headers instanceof Map).to.equal(true);
      expect(headers.get('subject')).to.equal('[pls ignore] Test email subject');

      expect(mail.attachments.length).to.equal(2);
      let attachment1: Attachment = mail.attachments[0];
      expect(attachment1.fileName).to.equal('image.png');
      expect(attachment1.contentType).to.equal('png');
      expect(attachment1.size).to.equal(4493);

      let attachment2: Attachment = mail.attachments[1];
      expect(attachment2.fileName).to.equal('71BPuv+iRbL._AC_SY741_.jpg');
      expect(attachment2.contentType).to.equal('jpeg');
      expect(attachment2.size).to.equal(89634);

      expect(mail.contentType).to.equal('multipart/mixed');
      expect(mail.classifiedTimestamp).to.equal(undefined);
      expect(mail.reviewedTimestamp).to.equal(undefined);
      // expect(mail.quarantineStatus).to.equal(QuarantineStatus.PENDING);
    });

    it('can parse jpg attachment', async () => {
      let rawEmail: string = fs.createReadStream(__dirname + EMAIL_WITH_JPG_ATTACHMENT);
      const mail = await EmailServerConnector.parseRawEmail(rawEmail);

      const attachments: Attachment[] = EmailServerConnector.parseAttachments(mail);
      // this email has one attachment of type jpeg
      expect(attachments.length).to.equal(1);
      expect(attachments[0].contentType).to.equal('jpeg');
    });

    it('can parse exe attachment', async () => {
      let rawEmail: string = fs.createReadStream(__dirname + EMAIL_WITH_EXE_ATTACHMENT);
      const mail = await EmailServerConnector.parseRawEmail(rawEmail);

      const attachments: Attachment[] = EmailServerConnector.parseAttachments(mail);
      // this email has one attachment of type jpeg
      expect(attachments.length).to.equal(1);
      expect(attachments[0].contentType).to.equal('exe');
    });
  });

});
