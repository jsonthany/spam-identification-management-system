import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { AttachmentAlgorithm } from '../../src/algorithm_modules/attachments_algorithm/AttachmentsAlgorithm';
import EmailFactory from '../factories/EmailFactory';
import { Attachment } from '../../src/types/Email'

chai.use(chaiAsPromised); // Bind chai-as-promised extension

describe('Attachments Algorithm should detect unsafe attachments', () => {

  const attachmentAlgorithm: AttachmentAlgorithm = new AttachmentAlgorithm()

  it('email with unexecutable attachment should have a low/zero risk score', async () => {
    // this email has one attachment of type jpeg
    const jpgAttachment: Attachment = {
        fileName: "fake.jpg",
        contentType: "jpeg",
        size: 112
    };

    const mail = new EmailFactory().withAttachments([jpgAttachment]);

    // this email should have risk score = AttachmentAlgorithm.SAFE_ATTACHMENT_PENALTY
    const riskScore: number = attachmentAlgorithm.getRiskScore(mail);
    expect(riskScore).to.equal(0);
  });

  it('email with executable attachment should have a high risk score', async () => {
    // this email has one attachment of type exe
    const exeAttachment: Attachment = {
        fileName: "fake.exe",
        contentType: "exe",
        size: 112
    };
    
    const mail = new EmailFactory().withAttachments([exeAttachment]);

    // this email should have risk score = AttachmentAlgorithm.UNSAFE_ATTACHMENT_PENALTY
    const riskScore: number = attachmentAlgorithm.getRiskScore(mail);
    expect(riskScore).to.equal(100);
  });
});
