import {Database} from "./database/Database";

interface classifierMetricsInterface {
    SAFE: number;
    SUSPECT: number;
    QUARANTINE: number;
}

interface timeFrameInterface {
    oneDay: classifierMetricsInterface;
    oneWeek: classifierMetricsInterface;
    oneMonth: classifierMetricsInterface;
}

export class MetricsGenerator {

    static async getClassifierMetrics() {
        const db: Database = new Database();
        const floorTime = new Date();
        // @ts-ignore
        floorTime.setDate(floorTime.getDate() - 31);
        const query = `select classifiedtimestamp, classifierresult from emails where classifiedtimestamp >= '${floorTime.toISOString().slice(0, 19).replace('T', ' ')}';`;
        const response = await db.query(query);

        const classificationStatistics: timeFrameInterface = {
            oneDay: {
                SAFE: 0,
                SUSPECT: 0,
                QUARANTINE: 0,
            },
            oneWeek: {
                SAFE: 0,
                SUSPECT: 0,
                QUARANTINE: 0,
            },
            oneMonth: {
                SAFE: 0,
                SUSPECT: 0,
                QUARANTINE: 0,
            }
        }

        const averageRiskScore: timeFrameInterface = {
            oneDay: {
                SAFE: 0,
                SUSPECT: 0,
                QUARANTINE: 0,
            },
            oneWeek: {
                SAFE: 0,
                SUSPECT: 0,
                QUARANTINE: 0,
            },
            oneMonth: {
                SAFE: 0,
                SUSPECT: 0,
                QUARANTINE: 0,
            }
        }

        response.rows.forEach((x: any) => {
            const comparisonDate = new Date();
            const classifiedDate = x[0];
            const metricsData: {classification: string, riskScore: number} = JSON.parse(x[1]);

            if (classifiedDate >= comparisonDate.setDate(comparisonDate.getDate() - 1)) {
                // @ts-ignore
                classificationStatistics['oneDay'][metricsData['classification']] += 1;
                // @ts-ignore
                averageRiskScore['oneDay'][metricsData['classification']] += metricsData['riskScore'];
            }
            if (classifiedDate >= comparisonDate.setDate(comparisonDate.getDate() - 6)) {
                // @ts-ignore
                classificationStatistics['oneWeek'][metricsData['classification']] += 1;
                // @ts-ignore
                averageRiskScore['oneWeek'][metricsData['classification']] += metricsData['riskScore'];
            }
            // @ts-ignore
            classificationStatistics['oneMonth'][metricsData['classification']] += 1;
            // @ts-ignore
            averageRiskScore['oneMonth'][metricsData['classification']] += metricsData['riskScore'];
        })

        Object.entries(classificationStatistics).forEach(([timeframe, data]) => {
            Object.entries(data).forEach(([key, value]) => {
                if (value !== 0) {
                    // @ts-ignore
                    averageRiskScore[timeframe][key] /= value;
                }
            })
        });

        return [classificationStatistics, averageRiskScore];
    }

    static async getQuarantineStatusData() {
        const db: Database = new Database;
        const query = `select classifiedtimestamp, quarantinestatus from emails
                       where quarantinestatus!='NULL';`;
        const response = await db.query(query);
        let countPending = 0;
        response.rows.forEach((x) => {
            if (x[1] == 'PENDING') {
                countPending += 1;
            }
        })
        return [countPending, response.rows];
    }
}
