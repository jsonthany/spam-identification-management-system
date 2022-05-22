import {Email} from "../types/Email";
import Spelling from "./body_algorithm/Spelling";
import {IAlgorithm} from "./IAlgorithm";

class ValidSenderAddressAlgorithm implements IAlgorithm {
    private wordCache: Map<string, boolean> = new Map();
    private twoLetterWordSet: Set<string> = new Set(
        [
            "ad", "ai", "al", "am", "an", "ar", "as", "at", "ba", "bo", "by", "do", "go", "ha",
            "he", "hi", "ho", "id", "if", "in", "is", "it", "ma", "of", "oh", "on", "op", "or",
            "ow", "ox", "pa", "re", "to", "un", "up", "us", "ya", "yo"
        ]);
    private RANDOMLY_GENERATED_EMAIL_ADDR_THRESHOLD = 0.4;
    private RANDOMLY_GENERATED_EMAIL_ADDR_PENALTY = 100;

    getRiskScore(e: Email): number {
        let riskScore = 0;

        const fromAddressID = e.fromAddressID

        const wordPercentageInAddr: number = this.getDictionaryWordPercentage(fromAddressID.username);

        // if the email address has less than threshold % non english word, i.e. w4q14rf75@gmail.com
        if (wordPercentageInAddr < this.RANDOMLY_GENERATED_EMAIL_ADDR_THRESHOLD) {
            // increase risk score
            riskScore += (1 - wordPercentageInAddr) * this.RANDOMLY_GENERATED_EMAIL_ADDR_PENALTY;
        }

        return riskScore;
    }

    /**
     * Returns the percentage of sum of the length of actual English words in the email
     * This is because a lot of spam emails have randomly generated addresses, e.g. bn1m1a4sftyjztx1fa@gmail.com
     * @param userName the part of string before @ in email address
     * @returns (length of real words)/(length of the address)
     */
    public getDictionaryWordPercentage(userName: string): number {
        // for this function, given "tomandjerry101", it will be analyzed as
        // "tom(word) and(word) jerry(word) 101(nonword)", so it will return a percentage of 12/15

        const partsPer: Map<string, number> = new Map();

        // usernames could have dots
        for (const part of userName.split(".")) {
            const per: number = this.getDictionaryWordLengthSumForPart(part);
            partsPer.set(part, per);
        }
        // ['jerry', 5], ['tom123', 3]

        let wordLengthSum = 0;
        let totalLengthSum = 0;
        partsPer.forEach((v: number, k: string, m: Map<string, number>) => {
            wordLengthSum += v;
            totalLengthSum += k.length;
        });
        // (5 + 3)/(5 + 6)
        return wordLengthSum / totalLengthSum;
    }

    private getDictionaryWordLengthSumForPart(userName: string): number {
        // for this function, given "tomandjerry101", it will be analyzed as
        // "tom(word) and(word) jerry(word) 101(nonword)", so it will return a length sum of 11
        if (this.isWord(userName)) {
            return userName.length;
        }

        const getLongestLengthWordListMemo: Map<number, [number, string[]]> = new Map();
        const longestWordList: [number, string[]] = this.getLongestLengthWordList(userName, 0, getLongestLengthWordListMemo);

        return longestWordList[0];
    }

    /**
     * Returns a list of English words in given string, if multiple combination exists,
     * return the one with longest length sum of each word.
     *
     * @param str the part of string before @ in email address
     * @param start
     * @param getLongestLengthWordListMemo
     * @returns [sum of english word length, [english words]]
     */
    public getLongestLengthWordList(str: string, start: number, getLongestLengthWordListMemo: Map<number, [number, string[]]>): [number, string[]] {
        if (getLongestLengthWordListMemo.has(start)) {
            return getLongestLengthWordListMemo.get(start)!;
        }

        let maxLengthSum = 0;
        let longestWordList: string[] = [];

        const len: number = str.length;

        for (let i=start+2; i<=len; ++i) {
            const current: string = str.substring(start, i);

            const restLongestList: [number, string[]] = this.getLongestLengthWordList(str, i, getLongestLengthWordListMemo);

            let currentLengthSum: number = restLongestList[0];

            // since we are using memo, we need to make a deep clone
            const listCopy: string[] = [...restLongestList[1]];

            // nonsense 2 letter words are messing up the actual words, handpick a list of 2 letter words
            const wordLen: number = current.length;
            if ((wordLen > 2 && this.isWord(current)) || this.isValidTwoLetterWord(current)) {
                currentLengthSum += current.length;
                listCopy.unshift(current);
            }

            if (currentLengthSum > maxLengthSum) {
                maxLengthSum = currentLengthSum;
                longestWordList = listCopy;
            }

        }

        const res: [number, string[]] = [maxLengthSum, longestWordList];

        getLongestLengthWordListMemo.set(start, res);

        return res;
    }

    public isWord(word: string): boolean {
        if (this.wordCache.has(word)) {
            return this.wordCache.get(word)!;
        }

        // spell check will work on words and most first names, but not so much on last names, which is common in email address
        const isWord: boolean = Spelling.isSpelledCorrectly(word);
        this.wordCache.set(word, isWord);
        
        return isWord;
    }

    private isValidTwoLetterWord(str: string): boolean {
        return this.twoLetterWordSet.has(str);
    }
}

export default ValidSenderAddressAlgorithm