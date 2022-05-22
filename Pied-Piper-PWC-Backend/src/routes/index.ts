import { Router } from 'express';
import AnalyzeRouter from './analyze';
import EmailsRouter from './emails';
import ConfigurationRouter from './configuration';
import MetricsRouter from './metrics';

const BaseRouter = Router();

BaseRouter.use('/analyze', AnalyzeRouter);
BaseRouter.use('/emails', EmailsRouter);
BaseRouter.use('/configuration', ConfigurationRouter);
BaseRouter.use('/metrics', MetricsRouter);

export default BaseRouter;
