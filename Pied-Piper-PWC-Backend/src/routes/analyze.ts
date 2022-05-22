import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Classification, ClassifierResult } from '../types/Classifier';
import { RequestWithBody, ResponseWithBody } from '../types/Express';
import { EmailServerConnector } from '../EmailServerConnector';

const AnalyzeRouter = Router();

AnalyzeRouter.post('/', async (req: RequestWithBody<AnalyzeReqBody>, res: ResponseWithBody<AnalyzeResBody>) => {
  const rawEmail: string = req?.body?.raw;

  if (!rawEmail) {
    res.status(StatusCodes.BAD_REQUEST).json();
    return;
  }

  try {
    const analyzeResBody: AnalyzeResBody = await EmailServerConnector.handleEmail(rawEmail);
    res.status(StatusCodes.OK).json(analyzeResBody);
  } catch (err) {
    console.log(err)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
  }
});

export default AnalyzeRouter;

interface AnalyzeReqBody {
  raw: string;
}

export interface AnalyzeResBody {
  classifiedTimestamp?: string;
  emailId: string;
  classifierResult: ClassifierResult;
}
