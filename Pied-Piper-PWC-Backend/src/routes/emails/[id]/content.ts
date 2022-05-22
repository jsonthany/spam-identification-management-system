import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ResponseWithBody } from '../../../types/Express';
import { ContentType } from '../../../types/MIME';

const EmailContentRouter = Router({ mergeParams: true });

EmailContentRouter.get<{ id: string }>('/', (req, res: ResponseWithBody<EmailContent>) => {
  res.status(StatusCodes.OK).json();
});

export default EmailContentRouter;

interface EmailContent {
  id: string;
  contentType: ContentType;
  headers: string;
  body: string;
}
