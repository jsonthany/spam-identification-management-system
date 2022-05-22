import Configuration from './interfaces/Configuration';

export const emptyConfig: Configuration = {
  suspectThreshold: 0,
  quarantineThreshold: 0,
  attachmentsAlgorithmScore: 0,
  bodyAlgorithmScore: 0,
  headerAlgorithmScore: 0,
  fromAlgorithmScore: 0,
  validSenderAddressAlgorithmScore: 0,
  senderAddressSimilarityAlgorithmScore: 0,
};

export const starterGoodEmailsResponse = {
  names: ['id', 'email'],
  rows: [
    [0, 'normal@email.com'],
    [1, 'another@email.com'],
  ],
  status: 'SELECT 2',
};

export const starterBadEmailsResponse = {
  names: ['id', 'email'],
  rows: [[0, 'prince@nigeria.com']],
  status: 'SELECT 1',
};
