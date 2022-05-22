import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaispies from 'chai-spies';
import Spelling from '../../src/algorithm_modules/body_algorithm/Spelling';
import ValidSenderAddressAlgorithm from '../../src/algorithm_modules/validSenderAddressAlgorithm';
import Random from '../factories/Random';

chai.use(chaiAsPromised); // Bind chai-as-promised extension
chai.use(chaispies);

describe('email address english word percentage check (word break)', () => {
    let emailAddrAlgo: ValidSenderAddressAlgorithm = new ValidSenderAddressAlgorithm();
  
    chai.spy.on(emailAddrAlgo, 'isWord', function(word: string) {
      let wordSet: Set<string> = new Set();
  
      wordSet.add("D");
      wordSet.add("to");
      wordSet.add("tommm");
      wordSet.add("jerry");
      wordSet.add("and");
      wordSet.add("rry");
      wordSet.add("man");
      wordSet.add("an");
      wordSet.add("andreaaaaaaaa");
      wordSet.add("drea");

      wordSet.add("richard");
      wordSet.add("rich");
  
      return wordSet.has(word);
    });

    it('getDictionayWordPercentage works', async () => {
        let str: string = "tommm.jerry111"
        let per: number = emailAddrAlgo.getDictionaryWordPercentage(str);
        expect(per).to.equal(10/13);
    });

    it('getDictionayWordPercentage should chose richard over rich', async () => {    
        let per: number = emailAddrAlgo.getDictionaryWordPercentage("richard");
        expect(per).to.equal(7/7);
    });

    it('getDictionayWordPercentage should skip chars to get max result', async () => {    
        let per: number = emailAddrAlgo.getDictionaryWordPercentage("richard111jerry");
        expect(per).to.equal(12/15);
    });
  
    it('getLongestLengthWordList works', async () => {
      let str: string = "andreaaaabbtommm11mmmmmandjerry101"
      let res = emailAddrAlgo.getLongestLengthWordList(str, 0, new Map());
    
      expect(res[1]).deep.equal([ 'an', 'drea', 'tommm', 'and', 'jerry' ]);
    });

    it('wordCache works', async () => {
        let random = new Random();
        let validWord: string = random.text();

        // reset wordCache by creating new obj
        emailAddrAlgo = new ValidSenderAddressAlgorithm();

        let spySpellChecker = chai.spy.on(Spelling, 'isSpelledCorrectly');

        // first call to isWord, it will call Spelling.isSpelledCorrectly as the wordCache doesnt have this word
        emailAddrAlgo.isWord(validWord);

        // second call to isWord, it will NOT call Spelling.isSpelledCorrectly, it will look in cache instead
        emailAddrAlgo.isWord(validWord);
        expect(spySpellChecker).to.have.been.called.once;
    });
  });