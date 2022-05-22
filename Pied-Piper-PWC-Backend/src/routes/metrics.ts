import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { MetricsGenerator } from "../MetricsGenerator";

const MetricsRouter = Router();

MetricsRouter.get('/classificationData', async (req: any, res: any) => {
  try {
    const classificationData = await MetricsGenerator.getClassifierMetrics();
    res.status(StatusCodes.OK).json({
      classificationCount: classificationData[0],
      averageRiskScores: classificationData[1]
    });
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST);
  }
});

MetricsRouter.get('/quarantineData', async (req: any, res: any) => {
  try {
    const quarantineStatusData = await MetricsGenerator.getQuarantineStatusData();
    res.status(StatusCodes.OK).json({
      totalPending: quarantineStatusData[0],
      falsePositives: quarantineStatusData[1]
    });
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST);
  }
});

export default MetricsRouter;

type timeframe = {
  timeframe: string;
};
