import express, { Request, Response, NextFunction } from 'express';
import http, { IncomingHttpHeaders } from "http";
import mongodb from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const PORT: number | string = process.env.PORT || 3000;

const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
const VIDEO_STORAGE_PORT = parseInt(process.env.VIDEO_STORAGE_PORT);
const DBHOST = process.env.DBHOST;
const DBNAME = process.env.DBNAME;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


async function main () {
  const client = await mongodb.MongoClient.connect(DBHOST);
  const db = client.db(DBNAME);
  
  const videos = db.collection('videos');

  app.get('/', (req, res) => res.send('Hello World'));

  app.get('/video', async (req: Request, res: Response) => {
      const id = Number(req.query.id);
      const videoId = new mongodb.ObjectId(id);
      
      const videoRecord = await videos.findOne({ _id: videoId });
      if (!videoRecord) return res.sendStatus(404);

      const forwardRequest = http.request({
        host: VIDEO_STORAGE_HOST,
        port: VIDEO_STORAGE_PORT,
        path: `/video?path=${videoRecord.videoPath}`,
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
};

main()
  .catch(err => {
    console.log('Video streaming microservice failed to start.');
    console.error(err && err.stack || err);
  });


