import { Request, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { QuarantineHandler } from '../../QuarantineHandler';
import { ClassifierResult, QuarantineStatus } from '../../types/Classifier';
import { InvalidRequestError } from '../../types/Error';
import { ResponseWithBody } from '../../types/Express';
import { performGetEmailsQuery } from '../emails';
import EmailContentRouter from './[id]/content';

const EmailRouter = Router({ mergeParams: true });
const quarantineHandler = new QuarantineHandler()

EmailRouter.get<{ id: string }>('/', async (req: Request, res: ResponseWithBody<Email>) => {

  let email: Partial<Email> = {
    id: req.params.id
  }
  try {
    let emails: Array<Email> = await performGetEmailsQuery(undefined, email, true)

    if (emails.length != 1)
      throw new InvalidRequestError()

    res.status(StatusCodes.OK).json(emails[0]);
  } catch (error) {

    if (error instanceof InvalidRequestError) {
      res.status(StatusCodes.BAD_REQUEST).send()
    }
    else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
  }
});


EmailRouter.delete<{ id: string }>('/', async (req, res: ResponseWithBody<Email>) => {
  try {
    // await deleteEmailQuery(req.params.id)
    await quarantineHandler.deleteEmail(req.params.id)
    res.status(StatusCodes.OK).json();
  } catch {
    res.status(StatusCodes.BAD_REQUEST).json()
  }
});

EmailRouter.use('/content', EmailContentRouter);

export default EmailRouter;

/**
 * Performs a DELETE on email with id 
 * @param id 
 */
function deleteEmailQuery(id: string) {
  quarantineHandler.deleteEmail(id)
}

// Not the same as src/types/Email.ts
export interface Email {
  id: string;
  fromAddress: string;
  toAddress: string;
  receivedTimestamp: string;
  classifiedTimestamp: string;
  reviewedTimestamp: string;
  classifierResult: ClassifierResult;
  quarantineStatus: QuarantineStatus | string;
  emailBody: string;
  emailSubject: string;
  rawEmail?: string
}
