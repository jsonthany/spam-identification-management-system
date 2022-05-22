import { Email } from "../../types/Email";
import { IAlgorithm } from "../IAlgorithm";
import { suspiciousKeywords } from "./SuspiciousKeywords";

export class HeaderAlgorithm implements IAlgorithm {
    private susKeywordsSet: Set<string> = new Set();
    private SUSPICIOUS_SUBJECT_HEADER_PENALTY = 25;
    private LACK_OF_SPF_HEADER_PENALTY = 25;
    private LACK_OF_DKIM_HEADER_PENALTY = 25;
    private LACK_OF_DMARC_HEADER_PENALTY = 25;

    /**
     * Returns a risk score given an Email
     * @param e Email obj
     * @returns a number in the range of 0 - 100
     */
    getRiskScore(e: Email): number {
        let riskScore = 0;

        const headers: Map<string, any> = e.headers;

        const subject = headers.get('subject');

        if (subject) {
            const hasSuspiciousSubjectHeader: boolean = this.hasSuspiciousSubjectHeader(subject);

            if (hasSuspiciousSubjectHeader) {
                console.log("suspicious subject header")
                riskScore += this.SUSPICIOUS_SUBJECT_HEADER_PENALTY;
            }
        }

        // if "Authentication-Results" header is empty, we dont have any SPF or DKIM auth,
        // but this doesnt mean its unsafe (at least the email i sent to myself does not have them)
        const authRes = headers.get('authentication-results');    // is an array
        // mx.google.com;
        // dkim=pass header.i=@ubc.ca header.s=s1 header.b=TbbsLwhP;
        // spf=pass (google.com: domain of ubc.systems@ubc.ca designates 142.103.203.6 as permitted sender) smtp.mailfrom=ubc.systems@ubc.ca;
        // dmarc=pass (p=NONE sp=NONE dis=NONE) header.from=ubc.ca

        if (authRes) {
            const authentications: string[] = authRes.split(";");

            // technically these should NOT be init with true, bc we can have empty headers, but since we only care about false...
            let hasSPFHeader = true;
            let hasDKIMHeader = true;
            let hasDMARCHeader = true;

            for (const authentication of authentications) {
                if (authentication.includes("spf=fail")) {
                    // reference: RFC 7208, RFC 7001
                    hasSPFHeader = false;
                } else if (authentication.includes("dkim=fail")) {
                    hasDKIMHeader = false;
                } else if (authentication.includes("dmarc=fail")) {
                    hasDMARCHeader = false;
                }
            }

            if (!hasSPFHeader) {
                console.log("SPF penalty")
                riskScore += this.LACK_OF_SPF_HEADER_PENALTY;
            }

            if (!hasDKIMHeader) {
                console.log("Lack of DKIM header")
                riskScore += this.LACK_OF_DKIM_HEADER_PENALTY;
            }

            if (!hasDMARCHeader) {
                console.log("Lack of DMARC  header")
                riskScore += this.LACK_OF_DMARC_HEADER_PENALTY;
            }
        }

        return riskScore;
    }

    /**
     * Returns true if subject header is suspicious
     * @param subjectHeaders a string of email subject
     * @returns whether the subject header is considered suspicious based on ?? standards
     */
    private hasSuspiciousSubjectHeader(subjectHeaders: string): boolean {
        if (this.susKeywordsSet.size == 0) {
            this.initSusKeywordSet();
        }

        const words: string[] = subjectHeaders.split(" ");

        for (let word of words) {
            if (this.susKeywordsSet.has(word)) {
                return true;
            }
        }

        return false;
    }

    private initSusKeywordSet() {
        suspiciousKeywords.forEach(word => this.susKeywordsSet.add(word));
    }
    
}