import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import passport from 'passport';
import BearerToken from './authentication/BearerToken';
import BaseRouter from './routes';
import { config } from 'dotenv';
import {Classifier} from "./Classifier";

config()  // Read .env file

const app = express();

// Log requests to console
if (process.env.ENV === 'dev') {
  app.use(morgan('dev'));
}

// Middleware
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(cors());
app.use(helmet());

// Authentication middleware
passport.use(BearerToken);
app.use(passport.initialize());
app.use(passport.authenticate('bearer', { session: false }));

app.use('/', BaseRouter);

// Initialize initial configuration settings for email risks

Classifier.initializeClassificationParameter().then(() => {
  console.log("SERVER INITIALIZATION: Default configurations have been added")

  // Initializes the whitelist and quarantined emails
  Classifier.initializeEmailSets().then(() => {
    console.log("SERVER INITIALIZATION: Populated whitelists and quarantined emails in Classifier");

    app.listen(process.env.PORT, () => {
      console.log(`Express server listening at http://0.0.0.0:${process.env.PORT}`);
    });
  });
});
