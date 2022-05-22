import { Attachment, Email } from "../../types/Email";
import { IAlgorithm } from "../IAlgorithm";
import { unsafeAttachmentTypes } from "./UnsafeAttachmentTypes";

export class AttachmentAlgorithm implements IAlgorithm {
    private UNSAFE_ATTACHMENT_PENALTY = 100;
    private SAFE_ATTACHMENT_PENALTY = 0;

    getRiskScore(e: Email): number {
        let riskScore: number = 0;

        const attachments: Attachment[] = e.attachments;

        const attachmentsCategories: [number, number] = this.getAttachmentsCategories(attachments);

        const unsafeCount: number = attachmentsCategories[0];
        const safeCount: number = attachmentsCategories[1];

        if (unsafeCount > 0) {
            riskScore += this.UNSAFE_ATTACHMENT_PENALTY;
        }

        if (safeCount > 0) {
            riskScore += this.SAFE_ATTACHMENT_PENALTY;
        }

        return riskScore;
    }

    private getAttachmentsCategories(attachments: Attachment[]): [number, number] {
        let unsafeCount = 0;
        let safeCount = 0;

        const unsafeSet: Set<string> = new Set();
        // gmail already has a list of blocked file type. https://support.google.com/mail/answer/6590#zippy=%2Cmessages-that-have-attachments
        // see attachments_algorithm/UnsafeAttachmentTypes.ts

        for (const unsafe of unsafeAttachmentTypes) {
            unsafeSet.add(unsafe);
        }

        for (const attachment of attachments) {
            const attachmentType = attachment.fileName.split(".");

            if (unsafeSet.has(attachmentType[attachmentType.length - 1])) {
                unsafeCount++;
            } else {
                safeCount++;
            }
        }

        return [unsafeCount, safeCount];
    }
}