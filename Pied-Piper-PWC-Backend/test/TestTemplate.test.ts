import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Email } from '../src/types/Email';
import { EmailAddress } from '../src/types/EmailAddress';
import { CarbonCopy } from '../src/types/CarbonCopy';
import { Classification } from '../src/types/Classifier';
import Random from './factories/Random';
import EmailAddressFactory from './factories/EmailAddressFactory';
import EmailFactory from './factories/EmailFactory';
import CarbonCopyFactory from './factories/CarbonCopyFactory';
import EmailHeadersFactory from './factories/EmailHeadersFactory';

chai.use(chaiAsPromised); // Bind chai-as-promised extension

describe('Name of test suite or NameOfClass', () => {
  const somethingConstant: EmailAddress = new EmailAddressFactory()
    .withId('abc')
    .withUsername('jobs')
    .withDomain('apple.com')
    .getEmailAddress();

  let somethingDifferentAcrossAllTests: Email;
  let somethingDifferentInEachTest: CarbonCopy;

  before(() => {
    somethingDifferentAcrossAllTests = new EmailFactory()
      .withToAddressId(somethingConstant)
      .withHeaders(new EmailHeadersFactory().withDate(new Date('2022-02-22')).withFrom('me@hello.com').getHeaders())
      .withClassifierResult({
        classification: Classification.SUSPECT,
        riskScore: -1,
      })
      .getEmail();
  });

  beforeEach(() => {
    somethingDifferentInEachTest = new CarbonCopyFactory().withAddressId(somethingConstant.id).getCarbonCopy();
  });

  describe('oneFunctionToTest', () => {
    let somethingRandom: string;

    beforeEach(() => {
      somethingRandom = new Random().emailAddress();
    });

    // 'it' is alias for 'test'
    it('should work as expected', () => {
      expect(somethingDifferentAcrossAllTests).to.be.a('object');
      expect(somethingDifferentInEachTest).to.be.a('object');
      expect(somethingRandom).to.contain('@');
    });

    it('should produce correct result', () => {
      expect(somethingConstant.domain).to.match(/apple\.\w+/);
      expect(somethingDifferentAcrossAllTests.classifierResult).to.deep.equal({
        classification: Classification.SUSPECT,
        riskScore: -1,
      });
    });
  });

  describe('anotherFunctionToTest', () => {
    it('should resolve properly', async () => {
      const testPromise = new Promise((resolve) => {
        resolve('success! it works');
      });

      const result = await testPromise;

      expect(result).to.contain('it works');
    });

    it('should reject properly', async () => {
      const testPromise = new Promise((resolve, reject) => {
        reject(new Error('failed for some reason xyz'));
      });

      await expect(testPromise).to.be.rejectedWith(/xyz/);
    });
  });
});
