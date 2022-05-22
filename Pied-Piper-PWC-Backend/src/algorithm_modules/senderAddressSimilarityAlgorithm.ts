import { Classifier } from "../Classifier";
import { Email } from "../types/Email";
import { IAlgorithm } from "./IAlgorithm";
import stringSimilarity from "string-similarity";

class senderAddressSimilarityAlgorithm implements IAlgorithm {
    getRiskScore(e: Email): number {
        const emailId = e.fromAddressID.id;
        const from_domain = e.fromAddressID.domain;

        if (Classifier.whitelistNames.has(emailId)) {
            return 0;
        }

        const fullEmailRiskScore = senderAddressSimilarityAlgorithm.getHighestRiskScore(emailId, Classifier.whitelistNames);
        const domainRiskScore = senderAddressSimilarityAlgorithm.getHighestRiskScore(from_domain, Classifier.domain_whitelistNames);

        if (!Classifier.domain_whitelistNames.has(from_domain)) {
            return Math.max(fullEmailRiskScore, domainRiskScore);
        } else {
            return fullEmailRiskScore;
        }
    }

    private static getHighestRiskScore(emailString: string, comparisons: Set<string>): number {
        let output = 0;
        comparisons.forEach((e) => {
            const currScore = stringSimilarity.compareTwoStrings(emailString, e) * 100;
            if (currScore > output) {
                output = currScore;
            }
        })
        return output;
    }
}

export default senderAddressSimilarityAlgorithm