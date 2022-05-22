import Chance from 'chance';
import { emailContentTypes, ContentType } from '../../src/types/MIME';
import { Classification, QuarantineStatus } from '../../src/types/Classifier';
import { CarbonCopyField } from '../../src/types/CarbonCopy';

export default class Random {
  private chance: Chance.Chance;

  public constructor() {
    this.chance = new Chance();
  }

  public id(): string {
    return this.chance.guid();
  }

  public date(): Date {
    return this.chance.date();
  }

  public emailAddress(): string {
    return this.chance.email();
  }

  public contentType(): ContentType {
    return emailContentTypes[this.chance.integer({ min: 0, max: emailContentTypes.length - 1 })];
  }

  public text(): string {
    return this.chance.string();
  }

  public classification(): Classification {
    return this.chance.pickone(Object.values(Classification));
  }

  public quarantineStatus(): QuarantineStatus {
    return this.chance.pickone(Object.values(QuarantineStatus));
  }

  public carbonCopyField(): CarbonCopyField {
    return this.chance.pickone(Object.values(CarbonCopyField));
  }
}
