declare global {
  namespace Express {
    export interface Request {
      eOrP?: string;
    }
  }
}