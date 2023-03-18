import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import http, { IncomingHttpHeaders } from "http";

dotenv.config();

// if (!process.env.PORT) throw new Error('Please specify the port number [CA] for the HTTP server with the environment variable PORT.');
const PORT: number | string = process.env.PORT || 3000;

const isDev = process.env.NODE_ENV === 'development';

const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
const VIDEO_STORAGE_PORT = parseInt(process.env.VIDEO_STORAGE_PORT);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => res.send('Hello World'));

app.get('/videos', async (req: Request, res: Response) => {
    const forwardRequest = http.request({
      host: VIDEO_STORAGE_HOST,
      port: VIDEO_STORAGE_PORT,
      path: '/video?path=SampleVideo_1280x720_1mb.mp4',
      method: 'GET',
      headers: req.headers,
    },
    forwardResponse => {
      const headers = forwardResponse.headers as IncomingHttpHeaders;
      res.writeHead(forwardResponse.statusCode, headers);
      forwardResponse.pipe(res);
    });

    req.pipe(forwardRequest);
});



app.listen(PORT, () => console.log(`Video streaming microservice connected to port ${PORT}`));