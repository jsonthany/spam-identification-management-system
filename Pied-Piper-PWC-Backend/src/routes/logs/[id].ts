import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ResponseWithBody } from '../../types/Express';
import LogEntry from '../../types/LogEntry';

const LogRouter = Router({ mergeParams: true });

LogRouter.get<{ id: string }>('/', (req, res: ResponseWithBody<LogEntry>) => {
  res.status(StatusCodes.OK).json();
});

LogRouter.delete<{ id: string }>('/', (req, res: ResponseWithBody<LogEntry>) => {
  res.status(StatusCodes.OK).json();
});

export default LogRouter;
