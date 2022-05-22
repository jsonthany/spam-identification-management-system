import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { RequestWithBody, ResponseWithBody } from '../types/Express';
import Configuration from '../types/Configuration';
import {Classifier} from "../Classifier";
import {Result} from 'ts-postgres';
import {Database} from "../database/Database";
import {initialize} from "passport";

const ConfigurationRouter = Router();
const db = new Database()

// Get current configuration settings
ConfigurationRouter.get('/', (req, res: ResponseWithBody<Configuration>) => {
  try {
    res.status(StatusCodes.OK).json(Classifier.classificationSettings);
  } catch (err) {
    console.log(err);
    res.status(StatusCodes.BAD_REQUEST);
  }
});

// Update all configuration settings
ConfigurationRouter.patch('/', (req: RequestWithBody<any>, res: ResponseWithBody<any>) => {
  try {
    Classifier.adjustClassificationParameter(req.body.data).then((newConfiguration: Configuration) => {
      res.status(StatusCodes.OK).json(newConfiguration);
    }).catch((err) => {
      throw err;
    });
  } catch (e) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: "Unable to adjust classification parameters"
    })
  }
});

// Reset all configuration settings
ConfigurationRouter.patch('/reset', async (req: RequestWithBody<void>, res: ResponseWithBody<any>) => {
  try {
    Classifier.resetClassificationParameter().then((newSettings: Configuration) => {
      res.status(StatusCodes.OK).json(newSettings);
    });
  } catch (e) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: "Unable to reset classification parameters"
    })
  }
});

// Get all whitelist emails
ConfigurationRouter.get('/whitelistemails', async (req, res) => {
  try {
    const result: Result = await db.query(`SELECT * FROM whitelistemails`);
    res.status(StatusCodes.OK).json(result);
  } catch (e) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: "Unable to get whitelist emails from the database"
    })
  }
});

// Add a new whitelist email
ConfigurationRouter.put('/whitelistemails', async (req, res) => {
  try {
    const emailToAdd: string = req.body.email;

    // Check if the email already exists in the DB
    const selectionQuery = `SELECT * FROM whitelistemails WHERE email = '${emailToAdd}'`
    const selectionQueryResult: Result = await db.query(selectionQuery);

    // Email already exists, don't add it again
    if (selectionQueryResult.rows.length > 0) {
      res.status(StatusCodes.CONFLICT).json({
        error: "Email already exists in the whitelist emails database"
      })
    // Email does not exist, add it to the DB
    } else {
      const query = "INSERT INTO whitelistemails (email) VALUES ('" + emailToAdd + "') RETURNING *";
      const result: Result = await db.query(query);

      Classifier.whitelistNames.add(emailToAdd);
      Classifier.domain_whitelistNames.add(emailToAdd.split("@", 2)[1]);
      res.status(StatusCodes.OK).json(result);
    }
  } catch (e) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: "Unable to connect to the database"
    })
  }
});

// Delete a whitelist email
ConfigurationRouter.delete('/whitelistemails/:id', async (req, res) => {
  const {id} = req.params;
  const emailToRemoveQuery = "SELECT email FROM whitelistemails WHERE id = " + id;
  const emailAddressQuery: any = await db.query(emailToRemoveQuery);

  const query = "DELETE FROM whitelistemails WHERE id = " + id;
  const result: Result = await db.query(query);

  const emailAddressToRemove: string = emailAddressQuery.rows[0][0];
  Classifier.whitelistNames.delete(emailAddressToRemove);

  res.status(StatusCodes.NO_CONTENT).json(result);
});

// Get all quarantined emails
ConfigurationRouter.get("/quarantinedemails", async (req, res) => {
  try {
    const result: Result = await db.query(`SELECT * FROM quarantinedemails`);
    res.status(StatusCodes.OK).json(result);
  } catch (e) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: "Unable to get quarantinedemails emails from the database"
    })
  }
})

// Add a quarantined email
ConfigurationRouter.put("/quarantinedemails", async (req, res) => {
  try {
    const emailToAdd: string = req.body.email;

    // Check if the email already exists in the DB
    const selectionQuery = `SELECT * FROM quarantinedemails WHERE email = '${emailToAdd}'`
    const selectionQueryResult: Result = await db.query(selectionQuery);

    // Email already exists, don't add it again
    if (selectionQueryResult.rows.length > 0) {
      res.status(StatusCodes.CONFLICT).json({
        error: "Email already exists in the quarantine emails database"
      })
      // Email does not exist, add it to the DB
    } else {
      const query = "INSERT INTO quarantinedemails (email) VALUES ('" + emailToAdd + "') RETURNING *";
      const result: Result = await db.query(query);
      Classifier.quarantinedSenders.add(emailToAdd);
      res.status(StatusCodes.OK).json(result);
    }
  } catch (e) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: "Unable to connect to the database"
    })
  }
})

// Delete a quarantined email
ConfigurationRouter.delete('/quarantinedemails/:id', async (req, res) => {
  const {id} = req.params;
  const emailToRemoveQuery = "SELECT email FROM quarantinedemails WHERE id = " + id;
  const emailAddressQuery: any = await db.query(emailToRemoveQuery);

  const query = "DELETE FROM quarantinedemails WHERE id = " + id;
  const result: Result = await db.query(query);

  const emailAddressToRemove: string = emailAddressQuery.rows[0][0];
  Classifier.quarantinedSenders.delete(emailAddressToRemove);

  res.status(StatusCodes.NO_CONTENT).json(result);
});

export default ConfigurationRouter;
