// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import SpellChecker from "simple-spellchecker";

class Spelling {
    static isSpelledCorrectly(wordToTest: string): boolean {
        const dictionary = SpellChecker.getDictionarySync("en-US");
        return !dictionary.isMisspelled(wordToTest);
    }
}

export default Spelling
