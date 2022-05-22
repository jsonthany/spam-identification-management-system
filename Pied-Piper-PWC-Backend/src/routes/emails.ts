import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Result } from 'ts-postgres';
import { Database } from '../database/Database';
import { Classification, QuarantineStatus } from '../types/Classifier';
import { RequestWithQuery, ResponseWithBody, SortReqQuery, PaginationReqQuery, RequestWithBody } from '../types/Express';
import EmailRouter, { Email } from './emails/[id]';
import { InvalidRequestError } from '../types/Error';
import { QuarantineHandler } from '../QuarantineHandler';

const EmailsRouter = Router();
const db = new Database()
const QH = new QuarantineHandler()

EmailsRouter.get('/', async (req: RequestWithQuery<EmailsReqQuery>, res: ResponseWithBody<EmailsResponseObj>) => {
  try {

    let queryParams: EmailsReqQuery = req.query

    // Validate parameters 
    validateQueryParams_helper(queryParams)


    // Get emails
    let emails: Email[] = await performGetEmailsQuery(queryParams)


    // Pagination: Count the number of emails and divide it by page size
    let numEmails: number = await performCountEmailsQuery(queryParams)

    let emailsResponseObj: EmailsResponseObj = {
      page: Number(queryParams.page) || 1,
      numEmails: numEmails,
      data: emails
    }
    res.status(StatusCodes.OK).json(emailsResponseObj);

  } catch (error) {

    if (error instanceof InvalidRequestError) {
      res.status(StatusCodes.BAD_REQUEST).send()
    }
    else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }

  }
});

EmailsRouter.patch<{ id: string }>('/', async (req: RequestWithBody<Array<Partial<Email>>>, res: ResponseWithBody<Array<Email>>) => {
  let resArr: Array<Email> = []

  try {
    for (let i = 0; i < req.body.length; i++) {
      let email: Partial<Email> = req.body[i]

      // Emails must have ID
      if (!email.id)
        throw new InvalidRequestError()

      if (await performUpdateEmailsQuery(email)) {
        // Unquarantine email
        if (email.quarantineStatus === QuarantineStatus.ALLOWED) {
          QH.unquarantineEmail(email.id)
        }
        resArr.push(...await performGetEmailsQuery(undefined, email))
      }

    }

    res.status(StatusCodes.OK).json(resArr)

  } catch (error) {

    if (error instanceof InvalidRequestError) {
      res.status(StatusCodes.BAD_REQUEST).send()
    }
    else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
  }
});

EmailsRouter.use('/:id', EmailRouter);

export default EmailsRouter;

const sortMethods = [
  'fromAddressId',
  'toAddressId',
  'receivedTimestamp',
  'classifiedTimestamp',
  'reviewedTimestamp',
] as const;

type EmailsReqQuery = PaginationReqQuery &
  SortReqQuery & {
    orderBy: typeof sortMethods[number];
    classification?: Classification;
    quarantineStatus?: QuarantineStatus;
  };

type EmailsResponseObj = {
  page: number;
  numEmails: number;
  data: Email[];
}

/**
 * Returns Email[] in the format of Email located at src/routes/emails/[id]
 * @param queryParams 
 * @param email 
 * @returns Email[]
 */
export async function performGetEmailsQuery(queryParams?: EmailsReqQuery, email?: Partial<Email>, includeRawEmail?: boolean): Promise<Email[]> {

  let queryBuilder: string[] = [`
    select 
      Emails.id, 
      concat(EA1.displayname, ' <', EA1.username, '@', EA1.domain, '>'), 
      concat(EA2.displayname, ' <', EA2.username, '@', EA2.domain, '>'),
      receivedTimestamp,
      classifiedTimestamp,
      reviewedTimestamp,
      classifierResult,
      quarantineStatus,
      emailBody,
      emailSubject`]

  // Include rawEmail if includeRawEmail
  if (includeRawEmail) {
    queryBuilder.push(`,
      rawEmail
    `)
  }

  queryBuilder.push(`
    from Emails, EmailAddresses EA1, EmailAddresses EA2
    where 
      emails.fromAddressId = EA1.id and
      emails.toAddressId = EA2.id
  `)

  // Filter by quarantineStatus
  if (queryParams?.quarantineStatus) {
    queryBuilder.push(" and Emails.quarantineStatus = '" + queryParams.quarantineStatus + "'")
  }

  // Filter by email if email
  if (email) {
    queryBuilder.push(" and Emails.id = '" + email.id + "'")
  }

  if (queryParams?.orderBy) {
    queryBuilder.push(" ORDER BY " + queryParams.orderBy)

    if (queryParams.order)
      queryBuilder.push(" " + queryParams.order)
  }

  if (queryParams?.pageSize) {
    queryBuilder.push(" LIMIT " + queryParams.pageSize)

    if (queryParams.page)
      queryBuilder.push(" OFFSET " + String((Number(queryParams.page) - 1) * Number(queryParams.pageSize)))
  }

  queryBuilder.push(';')
  let query: string = queryBuilder.join('')
  let returnArray: Email[] = []
  let result: Result

  try {

    result = await db.query(query)
    result.rows.forEach((v) => {

      let email: Email = {
        id: v[0]?.toString() || "",
        fromAddress: v[1]?.toString() || "",
        toAddress: v[2]?.toString() || "",
        receivedTimestamp: v[3]?.toString() || "",
        classifiedTimestamp: v[4]?.toString() || "",
        reviewedTimestamp: v[5]?.toString() || "",
        classifierResult: JSON.parse(v[6]?.toString() || "0") || { classification: Classification.QUARANTINE },
        quarantineStatus: v[7]?.toString() || "PENDING",
        emailBody: v[8]?.toString() || "",
        emailSubject: v[9]?.toString() || "",
        rawEmail: v[10]?.toString() || ""
      }

      returnArray.push(email)
    })

    return Promise.resolve(returnArray)

  } catch (error) {

    return Promise.reject(error)
  }

}

/**
 * Validates whether the query passed by the client is valid.
 * @param qp Parameters passed by client to indicate sorting.
 * @throws InvalidRequestError
 */
function validateQueryParams_helper(qp: EmailsReqQuery): void {

  if (qp.page && !Number(qp.page))
    throw new InvalidRequestError();

  if (qp.pageSize && !Number(qp.pageSize))
    throw new InvalidRequestError();

  if (qp.orderBy && !(sortMethods.includes(qp.orderBy))) {
    throw new InvalidRequestError();
  }

  if (qp.order && !(['ASC', 'DESC'].includes(qp.order.toUpperCase())))
    throw new InvalidRequestError();

  if (qp.quarantineStatus && !(['ALLOWED', 'PENDING', 'DENIED'].includes(qp.quarantineStatus.toUpperCase())))
    throw new InvalidRequestError()
}

/**
 * Updates an email record using an Email partial
 * @param email 
 * @returns Promise<boolean>
 */
async function performUpdateEmailsQuery(email: Partial<Email>): Promise<boolean> {
  // Retrieve keys not equal to ID
  let keys: string[] = Object.keys(email).filter(v => v != "id")

  // if no values to update, continue
  if (keys.length == 0)
    return false

  let stringBuilder: string[] = [`
    update emails 
    set
  `]

  let emailObject = email as any

  keys.forEach(v => {
    stringBuilder.push(" " + v + " = '" + emailObject[v] + "'")
    stringBuilder.push(',')
  })
  stringBuilder.pop()

  stringBuilder.push(" where id = '" + email.id + "';")

  let query: string = stringBuilder.join('')

  try {

    let res = await db.query(query)
    return true
  } catch (error) {

    return false
  }
}

async function performCountEmailsQuery(queryParams?: EmailsReqQuery): Promise<number> {
  let queryBuilder: string[] = [`
    select count(*)
  `]

  queryBuilder.push(`
    from Emails, EmailAddresses EA1, EmailAddresses EA2
    where 
      emails.fromAddressId = EA1.id and
      emails.toAddressId = EA2.id
  `)

  // Filter by quarantineStatus
  if (queryParams?.quarantineStatus) {
    queryBuilder.push(" and Emails.quarantineStatus = '" + queryParams.quarantineStatus + "'")
  }

  let query = queryBuilder.join('')

  try {
    let res = await db.query(query)

    return Promise.resolve(Number(res.rows[0][0]))
  } catch (err) {
    return Promise.reject(err)
  }
}