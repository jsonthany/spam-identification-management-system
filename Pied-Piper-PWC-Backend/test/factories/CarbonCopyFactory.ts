import { Email } from '../../src/types/Email';
import { EmailAddress } from '../../src/types/EmailAddress';
import { CarbonCopy, CarbonCopyField } from '../../src/types/CarbonCopy';
import Random from './Random';

export default class CarbonCopyFactory implements CarbonCopy {
  id: string;
  emailId: Email['id'];
  addressId: EmailAddress['id'];
  type: CarbonCopyField;

  public constructor() {
    const random = new Random();

    this.id = random.id();
    this.emailId = random.id();
    this.addressId = random.id();
    this.type = random.carbonCopyField();
  }

  public withId(id: string) {
    this.id = id;
    return this;
  }

  public withEmailId(emailId: string) {
    this.emailId = emailId;
    return this;
  }

  public withAddressId(addressId: string) {
    this.addressId = addressId;
    return this;
  }

  public withType(type: CarbonCopyField) {
    this.type = type;
    return this;
  }

  public getCarbonCopy(): CarbonCopy {
    return {
      id: this.id,
      emailId: this.emailId,
      addressId: this.addressId,
      type: this.type,
    };
  }
}
