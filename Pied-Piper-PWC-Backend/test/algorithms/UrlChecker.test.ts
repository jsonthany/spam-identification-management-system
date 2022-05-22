import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import UrlChecker from '../../src/algorithm_modules/body_algorithm/UrlChecker';

chai.use(chaiAsPromised); // Bind chai-as-promised extension

describe('Url Checker', () => {

    let inputData: string[];

    it('should return false, indicating empty array of malicious urls given fake urls', async() => {
        inputData = ["http://http://www.urltocheck1.org/", "http://www.urltocheck2.org/", "http://www.urltocheck3.com/"];
        await expect(UrlChecker.isUrlMalicious(inputData)).to.eventually.equal(false);
    })

    it('should return false, indicating empty array of malicious urls given legitimate urls', async() => {
        inputData = ["http://www.google.com", "http://www.facebook.com"];
        await expect(UrlChecker.isUrlMalicious(inputData)).to.eventually.equal(false);
    })

    it('should return true, indicating array with detected malicious websites', async() => {
        inputData = ["http://malware.testing.google.test/testing/malware/*"];
        await expect(UrlChecker.isUrlMalicious(inputData)).to.eventually.equal(true);
    })

    it('should return true, indicating array with detected malicious websites given mixture of good and bad urls', async() => {
        inputData = ["http://malware.testing.google.test/testing/malware/*", "http://www.google.com", "http://www.facebook.com"];
        await expect(UrlChecker.isUrlMalicious(inputData)).to.eventually.equal(true);
    })
});