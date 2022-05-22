import { Request, Response } from 'express';
import { Send, Query } from 'express-serve-static-core';

export interface RequestWithQuery<ReqQuery extends Query> extends Request {
  query: ReqQuery;
}

export interface RequestWithBody<ReqBody> extends Request {
  body: ReqBody;
}

export interface RequestWithQueryBody<ReqQuery extends Query, ReqBody> extends Request {
  query: ReqQuery;
  body: ReqBody;
}

export interface ResponseWithBody<ResBody> extends Response {
  send: Send<ResBody, this>;
  json: Send<ResBody, this>;
}

export interface SortReqQuery extends Query {
  orderBy: string;
  order: 'ASC' | 'DESC';
}

export interface PaginationReqQuery extends Query {
  pageSize: string; // Per page
  page: string;
}
