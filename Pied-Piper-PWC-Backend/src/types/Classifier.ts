export interface ClassifierResult {
  classification: Classification;
  riskScore: number;
}

export enum Classification {
  SAFE = 'SAFE',
  SUSPECT = 'SUSPECT',
  QUARANTINE = 'QUARANTINE',
}

export enum QuarantineStatus {
  PENDING = 'PENDING',
  ALLOWED = 'ALLOWED',
  DENIED = 'DENIED',
}
