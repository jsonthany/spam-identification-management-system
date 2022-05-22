export default interface Configuration {
  suspectThreshold: number;
  quarantineThreshold: number;
  attachmentsAlgorithmScore: number;
  bodyAlgorithmScore: number;
  headerAlgorithmScore: number;
  fromAlgorithmScore: number;
  senderAddressSimilarityAlgorithmScore: number;
  validSenderAddressAlgorithmScore: number;
}
