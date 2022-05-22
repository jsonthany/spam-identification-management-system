import RiskRule from '../types/RiskRule';

export const defaultRiskRules: RiskRule[] = [
  {
    name: 'similarityToLegitimateEmails',
    description: 'Source email address is similar to a source in existing legitimate emails.',
    score: -1,
  },
  {
    name: 'grammaticalMistakes',
    description: 'Email body contains spelling or grammatical mistakes exceeding 20%.',
    score: -1,
  },
  {
    name: 'containsExecutable',
    description: 'Email contains non-executable attachments.',
    score: -1,
  },
  {
    name: 'containsAttachment',
    description: 'Email contains executable attachments (e.g., files ending in .exe, .bat, .sh, etc.).',
    score: -1,
  },
  {
    name: 'missingSPFAuthentication',
    description: 'Email does not contain an SPF authentication header.',
    score: -1,
  },
  {
    name: 'missingDKIMAuthentication',
    description: 'Email does not contain a DKIM authentication header.',
    score: -1,
  },
  {
    name: 'containsHyperlinks',
    description: 'Email contains hyperlinks.',
    score: -1,
  },
  {
    name: 'urlNotMatchingHrefTag',
    description: 'Email contains hyperlink where link text is a URL and does not match href tag.',
    score: -1,
  },
];
