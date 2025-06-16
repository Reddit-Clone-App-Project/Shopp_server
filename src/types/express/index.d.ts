import * as express from 'express';

declare global {
  namespace Express {
    export interface Request {
      eOrP?: string;
      user?: {
        id: number;
        email: string;
      };
    }
  }
}

