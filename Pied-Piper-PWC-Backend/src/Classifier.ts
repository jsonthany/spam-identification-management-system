import Configuration from './types/Configuration';
import {Email} from './types/Email';
import {Classification, ClassifierResult} from './types/Classifier';
import {AttachmentAlgorithm} from "./algorithm_modules/attachments_algorithm/AttachmentsAlgorithm";
import BodyAlgorithm from "./algorithm_modules/body_algorithm/BodyAlgorithm";
import {HeaderAlgorithm} from "./algorithm_modules/header_algorithm/HeaderAlgorithm";
import FromAlgorithm from "./algorithm_modules/FromAlgorithm";
import {Database} from "./database/Database";
import ValidSenderAddressAlgorithm from "./algorithm_modules/validSenderAddressAlgorithm";
import SenderAddressSimilarityAlgorithm from "./algorithm_modules/senderAddressSimilarityAlgorithm";

const db = new Database();

export class Classifier {
  public static whitelistNames: Set<string> = new Set<string>();
  public static domain_whitelistNames: Set<string> = new Set<string>();
  public static quarantinedSenders: Set<string> = new Set<string>();
  public static classificationSettings: Configuration;

  /**
   * Returns the classification of an email
   *
   * @param email email needed to be classified
   * @returns ClassifierResult includes one of { 'SAFE', 'SUSPECT', 'QUARANTINE' } AND a risk score
   */
  public static async classifyEmail(email: Email): Promise<ClassifierResult> {
    const attachments_algorithm = new AttachmentAlgorithm();
    const body_algorithm = new BodyAlgorithm();
    const header_algorithm = new HeaderAlgorithm();
    const from_algorithm = new FromAlgorithm();
    const sender_address_similarity_algorithm = new SenderAddressSimilarityAlgorithm();
    const valid_sender_address_algorithm = new ValidSenderAddressAlgorithm();

    const emailAddress = email.fromAddressID.username + "@" + email.fromAddressID.domain;
    const domainWildCardAddress = "*@" + email.fromAddressID.domain;

    // Email is on the quarantine line.
    if (Classifier.quarantinedSenders.has(emailAddress) || Classifier.quarantinedSenders.has(domainWildCardAddress)) {
      console.log("Email is QUARANTINED (REASON: Sender on quarantine list)");
      return {
        classification: Classification.QUARANTINE,
        riskScore: 100,
      };
    }

    // Email is on the white list and email headers are real
    if ((Classifier.whitelistNames.has(emailAddress) || Classifier.whitelistNames.has(domainWildCardAddress))
        && header_algorithm.getRiskScore(email) === 0) {
      console.log("Email is SAFE (REASON: Sender on allowed list)");
      return {
        classification: Classification.SAFE,
        riskScore: 0,
      };
    }

    const sumOfScores = this.classificationSettings.attachmentsAlgorithmScore +
        this.classificationSettings.bodyAlgorithmScore +
        this.classificationSettings.headerAlgorithmScore +
        this.classificationSettings.fromAlgorithmScore +
        this.classificationSettings.senderAddressSimilarityAlgorithmScore +
        this.classificationSettings.validSenderAddressAlgorithmScore

    let riskScore = 0;

    const attachmentRiskScore: number = attachments_algorithm.getRiskScore(email);
    console.log("attachments score: " + attachmentRiskScore);
    riskScore += attachmentRiskScore * this.classificationSettings.attachmentsAlgorithmScore;

    const bodyRiskScore: number = await body_algorithm.getRiskScore(email);
    console.log("body algorithm score: " + bodyRiskScore);
    riskScore += bodyRiskScore * this.classificationSettings.bodyAlgorithmScore;

    const headerRiskScore: number = header_algorithm.getRiskScore(email);
    console.log("header algorithm score: " + headerRiskScore);
    riskScore += headerRiskScore * this.classificationSettings.headerAlgorithmScore;

    const fromRiskScore: number = await from_algorithm.getRiskScore(email);
    console.log("from algorithm score: " + fromRiskScore);
    riskScore += fromRiskScore * this.classificationSettings.fromAlgorithmScore;

    const senderAddressSimilarityScore: number = sender_address_similarity_algorithm.getRiskScore(email);
    console.log("sender address similarity algorithm score: " + senderAddressSimilarityScore);
    riskScore += senderAddressSimilarityScore * this.classificationSettings.senderAddressSimilarityAlgorithmScore;

    const validSenderAddressAlgorithm: number = valid_sender_address_algorithm.getRiskScore(email);
    console.log("valid sender address algorithm score: " + validSenderAddressAlgorithm);
    riskScore += validSenderAddressAlgorithm * this.classificationSettings.senderAddressSimilarityAlgorithmScore;

    riskScore /= sumOfScores;

    let classification: Classification;
    if (riskScore >= Classifier.classificationSettings.quarantineThreshold) {
      classification = Classification.QUARANTINE;
    } else if (riskScore >= Classifier.classificationSettings.suspectThreshold) {
      classification = Classification.SUSPECT;
    } else {
      classification = Classification.SAFE;
    }

    console.log(`Email is ${classification} with a risk score of ${riskScore} (REASON: Based on algorithms)`);
    return {
      classification,
      riskScore,
    };
  }

  /**
   * Adjusts the classification thresholds and other parameters in the Classifier.
   *
   * @param setting setting to update to
   */
  public static async adjustClassificationParameter(setting: Configuration): Promise<Configuration> {
    Classifier.classificationSettings = setting;
    const query = `UPDATE configurationsettings 
        SET suspectthreshold = ${setting.suspectThreshold},
            quarantinethreshold = ${setting.quarantineThreshold},
            attachmentsalgorithmscore = ${setting.attachmentsAlgorithmScore},
            bodyalgorithmscore = ${setting.bodyAlgorithmScore},
            headeralgorithmscore = ${setting.headerAlgorithmScore},
            fromalgorithmscore = ${setting.fromAlgorithmScore},
            senderAddressSimilarityAlgorithmScore = ${setting.senderAddressSimilarityAlgorithmScore},
            validSenderAddressAlgorithmScore = ${setting.validSenderAddressAlgorithmScore}
         WHERE description = 'user'`;

    try {
      await db.query(query)
    } catch (err) {
      return Promise.reject(err);
    }

    return Classifier.classificationSettings;
  }

  /**
   * Resets the classification thresholds and other parameters in the Classifier to Pied Piper's recommended values.
   *
   */
  public static async resetClassificationParameter(): Promise<Configuration> {
    const results = await db.query(`
        SELECT suspectthreshold,quarantinethreshold,attachmentsalgorithmscore, bodyalgorithmscore, 
               headeralgorithmscore, fromalgorithmscore, senderAddressSimilarityAlgorithmScore,
               validSenderAddressAlgorithmScore
        FROM configurationsettings 
        WHERE description = 'default'`);

    const defaultSettings: Configuration = {
      suspectThreshold: <number> results.rows[0][0],
      quarantineThreshold: <number> results.rows[0][1],
      attachmentsAlgorithmScore: <number> results.rows[0][2],
      bodyAlgorithmScore: <number> results.rows[0][3],
      headerAlgorithmScore: <number> results.rows[0][4],
      fromAlgorithmScore: <number> results.rows[0][5],
      senderAddressSimilarityAlgorithmScore: <number> results.rows[0][6],
      validSenderAddressAlgorithmScore: <number> results.rows[0][7]
    }

    await this.adjustClassificationParameter(defaultSettings);

    return defaultSettings;
  }



  /**
   * Initializes the classification parameters based the last settings
   */
  public static async initializeClassificationParameter(): Promise<void> {
    const query = `SELECT suspectthreshold,quarantinethreshold,attachmentsalgorithmscore,
        bodyalgorithmscore, headeralgorithmscore, fromalgorithmscore, senderAddressSimilarityAlgorithmScore,
        validSenderAddressAlgorithmScore
        FROM configurationsettings
         WHERE description = 'user'`;
    const results = await db.query(query)
    const initialConfiguration: Configuration = {
      suspectThreshold: <number> results.rows[0][0],
      quarantineThreshold: <number> results.rows[0][1],
      attachmentsAlgorithmScore: <number> results.rows[0][2],
      bodyAlgorithmScore: <number> results.rows[0][3],
      headerAlgorithmScore: <number> results.rows[0][4],
      fromAlgorithmScore: <number> results.rows[0][5],
      senderAddressSimilarityAlgorithmScore: <number> results.rows[0][6],
      validSenderAddressAlgorithmScore: <number> results.rows[0][7]
    }
    await this.adjustClassificationParameter(initialConfiguration);
  }

  /**
   * Initializes the whitelist and quarantine list from database
   */
  public static async initializeEmailSets(): Promise<void> {
    const db = new Database();

    const whitelist_response = await db.query(`SELECT * FROM whitelistemails`);
    whitelist_response.rows?.forEach((arr) => {
      const currEmail = <string>arr[1];
      const spl: string[] = currEmail.split("@", 2);

      Classifier.whitelistNames.add(currEmail);
      Classifier.domain_whitelistNames.add(<string>spl[1]);
    })

    const quarantined_response = await db.query(`SELECT * FROM quarantinedemails`);
    quarantined_response.rows?.forEach((arr) => {
      Classifier.quarantinedSenders.add(<string>arr[1]);
    })
  }
}
