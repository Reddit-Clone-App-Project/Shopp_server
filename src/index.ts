import express, { Request, Response } from 'express';
import { Pool } from 'pg';

const app = express();
const port = 3000;

app.listen(port, () => {
    console.log(`Server running ar http://localhost:${port}`);
});