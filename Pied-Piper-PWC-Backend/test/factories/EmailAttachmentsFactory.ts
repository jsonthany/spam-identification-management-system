import { Attachment } from "../../src/types/Email";

export default class EmailAttachmentsFactory {
    private attachments: Attachment[];
  
    public constructor() {
        this.attachments = [];
    }
  
    public withAttactment(attachment: Attachment) {
        this.attachments.push(attachment);
        return this;
    }
  
    // ...add functions
  
    public getAttachments(): Attachment[] {
        return this.attachments;
    }
  }
  