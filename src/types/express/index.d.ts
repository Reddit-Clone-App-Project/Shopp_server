import * as express from 'express';
interface JwtPayload {
  id: number;
  role: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
};