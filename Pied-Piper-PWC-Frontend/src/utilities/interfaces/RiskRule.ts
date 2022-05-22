import { Nullable } from './Emails';
import {
  hasCorrectSchema,
  isArray,
  isArrayOfType,
} from '../helpers/typeAssertionHelpers';

interface RiskRule {
  name: string;
  description: string;
  score: number;
}

export const exampleRiskRule = {
  name: '',
  description: '',
  score: 0,
};

export const riskRuleDescriptions = {
  attachmentsAlgorithmScore: 'Email contains dangerous attachments',
  bodyAlgorithmScore: 'Email body contains any malicious links or a high number of spelling mistakes',
  headerAlgorithmScore: 'Email lacks correct authentication headers (SPF, DKIM, DMARC)',
  fromAlgorithmScore: 'Email is sent by unknown senders, senders that have sent other malicious emails, or senders that have the same display name as one or more other senders',
  validSenderAddressAlgorithmScore: 'Sender address contains text that appears randomly generated',
  senderAddressSimilarityAlgorithmScore: 'Sender address bears close similarity to an address on the allowed list',
};

function isRiskRule(value: unknown): value is RiskRule {
  return hasCorrectSchema(value, exampleRiskRule);
}

export function isRiskRuleArray(value: unknown): value is RiskRule[] {
  return isArrayOfType<RiskRule>(value, isRiskRule);
}

export function canMakeRiskRuleArray(value: unknown): boolean {
  if (isArray(value)) {
    return value.some(isRiskRule);
  }
  return false;
}

export function makeRiskRule(value: unknown): Nullable<RiskRule> {
  if (isRiskRule(value)) {
    return {
      name: value.name,
      description: value.description,
      score: value.score,
    };
  }
  return null;
}

export function makeRiskRuleArray(value: unknown[]): RiskRule[] {
  return value.map(makeRiskRule).filter(isRiskRule);
}

export default RiskRule;
