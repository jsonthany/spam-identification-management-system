import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { HeaderAlgorithm } from '../../src/algorithm_modules/header_algorithm/HeaderAlgorithm';
import EmailFactory from '../factories/EmailFactory';
import EmailHeadersFactory from '../factories/EmailHeadersFactory';

chai.use(chaiAsPromised); // Bind chai-as-promised extension

describe('Header Algorithm should detect suspicious subject header and failed SPF/DKIM/DMARC auth', () => {

  const headerAlgo: HeaderAlgorithm = new HeaderAlgorithm();

  it('email with suspicious subject header should give a 100 risk score', async () => {
    let headers: Map<string, any> = new EmailHeadersFactory().withSubject('free').getHeaders();
    let email: EmailFactory = new EmailFactory().withHeaders(headers);

    let riskScore: number = headerAlgo.getRiskScore(email);
    expect(riskScore).to.equal(25);
  });

  it('email with spf, dkim, and dmarc auth should give a 0 risk score', async () => {
    let headers: Map<string, any> = new EmailHeadersFactory().withAuthenticationResults(true, true, true).getHeaders();
    let email: EmailFactory = new EmailFactory().withHeaders(headers);

    let riskScore: number = headerAlgo.getRiskScore(email);
    expect(riskScore).to.equal(0);
  });

  it('email without spf, dkim, and dmarc auth (but did not fail any) should give a 0 risk score', async () => {
    let headers: Map<string, any> = new EmailHeadersFactory().getHeaders();
    let email: EmailFactory = new EmailFactory().withHeaders(headers);

    let riskScore: number = headerAlgo.getRiskScore(email);
    expect(riskScore).to.equal(0);
  });

  it('email with failed spf, dkim, and dmarc auth should give a 300 risk score', async () => {
    let headers: Map<string, any> = new EmailHeadersFactory().withAuthenticationResults(false, false, false).getHeaders();
    let email: EmailFactory = new EmailFactory().withHeaders(headers);

    let riskScore: number = headerAlgo.getRiskScore(email);
    expect(riskScore).to.equal(75);
  });

});
