import { hasCorrectSchema } from '../helpers/typeAssertionHelpers';
import capNumberValue from '../helpers/capNumberValue';
import isWithinRange from '../helpers/isWithinRange';

interface Configuration {
  suspectThreshold: number;
  quarantineThreshold: number;
  attachmentsAlgorithmScore: number;
  bodyAlgorithmScore: number;
  headerAlgorithmScore: number;
  fromAlgorithmScore: number;
  validSenderAddressAlgorithmScore: number;
  senderAddressSimilarityAlgorithmScore: number;
}

export const MAX_SCORE_VALUE = 100;

const exampleConfiguration = {
  suspectThreshold: 0,
  quarantineThreshold: 0,
  attachmentsAlgorithmScore: 0,
  bodyAlgorithmScore: 0,
  headerAlgorithmScore: 0,
  fromAlgorithmScore: 0,
  validSenderAddressAlgorithmScore: 0,
  senderAddressSimilarityAlgorithmScore: 0,
};

export function isConfiguration(value: unknown): value is Configuration {
  return hasCorrectSchema(
    value,
    exampleConfiguration,
  );
}

const validMaxSuspectThreshold = (quarantineThreshold: number): number => Math.min(
  quarantineThreshold,
  MAX_SCORE_VALUE,
);

export function generateConfigWithValidNumbers(
  config: Configuration,
): Configuration {
  return {
    suspectThreshold: capNumberValue(
      config.suspectThreshold,
      0,
      validMaxSuspectThreshold(config.quarantineThreshold),
    ),
    quarantineThreshold: capNumberValue(config.quarantineThreshold, 0, MAX_SCORE_VALUE),
    attachmentsAlgorithmScore: capNumberValue(config.attachmentsAlgorithmScore, 0, MAX_SCORE_VALUE),
    bodyAlgorithmScore: capNumberValue(config.bodyAlgorithmScore, 0, MAX_SCORE_VALUE),
    headerAlgorithmScore: capNumberValue(config.headerAlgorithmScore, 0, MAX_SCORE_VALUE),
    fromAlgorithmScore: capNumberValue(config.fromAlgorithmScore, 0, MAX_SCORE_VALUE),
    validSenderAddressAlgorithmScore: capNumberValue(
      config.validSenderAddressAlgorithmScore,
      0,
      MAX_SCORE_VALUE,
    ),
    senderAddressSimilarityAlgorithmScore: capNumberValue(
      config.senderAddressSimilarityAlgorithmScore,
      0,
      MAX_SCORE_VALUE,
    ),
  };
}

export function configHasValidNumbers(config: Configuration): boolean {
  const ruleScores = [
    config.attachmentsAlgorithmScore,
    config.bodyAlgorithmScore,
    config.headerAlgorithmScore,
    config.fromAlgorithmScore,
    config.validSenderAddressAlgorithmScore,
    config.senderAddressSimilarityAlgorithmScore,
  ];
  return (
    isWithinRange(config.suspectThreshold, 0, validMaxSuspectThreshold(config.quarantineThreshold))
    && isWithinRange(config.quarantineThreshold, 0, MAX_SCORE_VALUE)
    && ruleScores.every((value) => isWithinRange(value, 0, MAX_SCORE_VALUE))
  );
}

export default Configuration;
