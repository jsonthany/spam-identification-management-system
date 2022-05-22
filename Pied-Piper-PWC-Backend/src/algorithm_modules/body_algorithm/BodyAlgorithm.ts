import { Email } from "../../types/Email";
import { parse } from "parse5";
import Spelling from "./Spelling";
import UrlChecker from "./UrlChecker";

const ACCEPTABLE_BODY_TAGS = new Set<string>(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'ol', 'li', 'p', 'q', 'u', 'ul', 'b', 'i', 'cite', 'details',
    'datalist', 'div', 'dir', 'dl', 's', 'strong']);
const ENDS_WITH_PUNCTUATION_MARKS = new Set<string>(['.', '?', '!', ',', ':', ';', '...', '"', "'", ')', '".', "'.", ').']);
const BEGINS_WITH_PUNCTUATION_MARKS = new Set<string>(['...', '"', "'", '(']);


interface bodyValuesProps {
    hyperlinks: string[];
    body: string[];
}

class BodyAlgorithm {
    async getRiskScore(e: Email): Promise<number> {
        // If Email body is empty, return 0
        if (!e.body)
            return 0

        const bodyHTMLNodes = BodyAlgorithm.getBodyHTMLNodes(e.body);
        const emailBodyValues: bodyValuesProps = BodyAlgorithm.getBodyTextAndLinks(bodyHTMLNodes);
        const parsedBody = this.parseEmailBody(emailBodyValues.body);

        if (!parsedBody.length)
            return 0

        if (await BodyAlgorithm.getHyperlinkType(emailBodyValues.hyperlinks)) {
            return 100;
        } else {
            const typoCount = this.countTypo(parsedBody);
            const riskScore = typoCount / (parsedBody.length / 4);
            return Math.min(1, riskScore) * 100;
        }
    }

    // helper function to turn HTML to JSON by tags
    private static getBodyHTMLNodes(eBody: string): object[] {
        const parsedBody = parse(eBody);
        const HTMLNodes: any = parsedBody.childNodes.filter((node) => node.nodeName === "html")[0];
        const bodyNodes = HTMLNodes.childNodes.filter((node: { nodeName: string }) => node.nodeName === "body")[0].childNodes;

        return bodyNodes;
    }

    // helper function to get list of body text and hyperlinks
    private static getBodyTextAndLinks(bodyHTMLNodes: object[]): bodyValuesProps {
        let toVisit = bodyHTMLNodes;
        let hyperlinkList: string[] = []
        let bodyTextList: string[] = []

        while (toVisit.length) {
            let currentTag: any = toVisit.pop();

            // if current tag is a hyperlink, push to hyperlinkList
            if (currentTag.nodeName === "a") {
                hyperlinkList.push(currentTag.attrs[0].value)
            }

            // if current tag contains a text value, push to bodyTextList
            if (ACCEPTABLE_BODY_TAGS.has(currentTag.nodeName)) {
                if (currentTag &&
                    Object.prototype.hasOwnProperty.call(currentTag, "childNodes") &&
                    currentTag.childNodes.length &&
                    Object.prototype.hasOwnProperty.call(currentTag.childNodes[0], "value") &&
                    currentTag.childNodes[0].value) {
                    bodyTextList.push(currentTag.childNodes[0].value);
                }
            }

            if (Object.prototype.hasOwnProperty.call(currentTag, "childNodes")) {
                for (const childNode of currentTag.childNodes) {
                    if (Object.prototype.hasOwnProperty.call(childNode, "nodeName") && Object.prototype.hasOwnProperty.call(childNode, "childNodes")) {
                        toVisit.unshift(childNode);
                    }
                }
            }
        }

        let emailBodyValues = {
            hyperlinks: hyperlinkList,
            body: bodyTextList,
        }

        return emailBodyValues;
    }

    private static getHyperlinkType(hyperlinks: string[]): Promise<boolean> {
        return UrlChecker.isUrlMalicious(hyperlinks);
    }

    private countTypo(words: string[]): number {
        let typoCount: number = 0;

        words.forEach(word => {
            const isNum = !isNaN(Number(word));
            if (!isNum && !Spelling.isSpelledCorrectly(word)) {
                // console.log("mispelled word: " + word + ".");
                typoCount += 1;
            };
        })
        return typoCount;
    }

    private parseEmailBody(unparsedWords: string[]): string[] {
        const output: string[] = [];
        unparsedWords.forEach((unparsedString) => {
            const toBeParsed = unparsedString.split(" ");
            toBeParsed.forEach((parsedWord) => {
                if (BEGINS_WITH_PUNCTUATION_MARKS.has(parsedWord[0])) {
                    parsedWord = parsedWord.substring(1);
                }
                if (ENDS_WITH_PUNCTUATION_MARKS.has(parsedWord[parsedWord.length - 1])) {
                    parsedWord = parsedWord = parsedWord.substring(0, parsedWord.length - 1);
                }
                if (parsedWord.length > 0) output.push(parsedWord);
            })
        })

        return output;
    }
}

export default BodyAlgorithm;