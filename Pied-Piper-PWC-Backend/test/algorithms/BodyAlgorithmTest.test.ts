import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Spelling from "../../src/algorithm_modules/body_algorithm/Spelling";

chai.use(chaiAsPromised); // Bind chai-as-promised extension

describe('Should test body algorithm tests', () => {

    it('Should correctly check word spelling', async () => {
        expect(Spelling.isSpelledCorrectly("house")).to.equal(true);
        expect(Spelling.isSpelledCorrectly("House")).to.equal(true);
        expect(Spelling.isSpelledCorrectly("HouSE")).to.equal(true);
        expect(Spelling.isSpelledCorrectly("dog")).to.equal(true);
        expect(Spelling.isSpelledCorrectly("dOG")).to.equal(true);
        expect(Spelling.isSpelledCorrectly("university")).to.equal(true);

        expect(Spelling.isSpelledCorrectly("huose")).to.equal(false);
        expect(Spelling.isSpelledCorrectly("huOSe")).to.equal(false);
        expect(Spelling.isSpelledCorrectly("abcdfs")).to.equal(false);
        expect(Spelling.isSpelledCorrectly("helo")).to.equal(false);
        expect(Spelling.isSpelledCorrectly("HELO")).to.equal(false);
    })
});
