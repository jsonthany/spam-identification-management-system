import axios from "axios";

// API documentation: https://developers.google.com/safe-browsing/v4/lookup-api#Overview
class UrlChecker {
    static isUrlMalicious = async (hyperlinkList: string[]): Promise<boolean> => {
        let threatEntries = this.createThreatEntries(hyperlinkList)
        const requestBody = {
            "client": {
                "clientId":      "yourcompanyname",
                "clientVersion": "1.5.2"
            },
            "threatInfo": {
                "threatTypes":      ["THREAT_TYPE_UNSPECIFIED", "MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                "platformTypes":    ["ANY_PLATFORM"],
                "threatEntryTypes": ["URL"],
                "threatEntries": threatEntries
            }
        }
        try {
            const res = await axios.post(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env['GOOGLE_SAFE_BROWSING_API']}`, requestBody);
            const response = res.data;
            return response.hasOwnProperty('matches');
        } catch (e) {
            return false;
        }
    }

    private static createThreatEntries = (hyperlinkList: string[]) => {
        let output: { url: string; }[] = [];
        hyperlinkList.forEach((link) => {
            output.push({'url': `${link}`})
        })
        return output;
    }
}

export default UrlChecker;