import express, { Request, Response, NextFunction } from 'express';
import http, { IncomingHttpHeaders } from "http";
import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';

import dotenv from 'dotenv';
dotenv.config();

const PORT: number | string = process.env.PORT || 3000;

const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
const VIDEO_STORAGE_PORT = parseInt(process.env.VIDEO_STORAGE_PORT);
const DBHOST = process.env.DBHOST;
const DBNAME = process.env.DBNAME;

// async function main () {
//   const client = await MongoClient.connect(DBHOST);
//   const db = client.db(DBNAME);
  
//   const videos = db.collection('videos');

//   app.get('/', (req, res) => res.send('Hello World'));

//   app.get('/video', async (req: Request, res: Response) => {
//       const id = req.query.id.toString();
//       const videoId = new ObjectId(id);

//       const videoRecord = await videos.findOne({ _id: videoId });

//       console.log('Result from query: ', videoRecord)
//       if (!videoRecord) return res.sendStatus(404);

//       const forwardRequest = http.request({
//         host: VIDEO_STORAGE_HOST,
//         port: VIDEO_STORAGE_PORT,
//         path: `/video?path=${videoRecord.videoPath}`,
//         method: 'GET',
//         headers: req.headers,
//       },
//       forwardResponse => {
//         const headers = forwardResponse.headers as IncomingHttpHeaders;
//         res.writeHead(forwardResponse.statusCode, headers);
//         forwardResponse.pipe(res);
//       });

//       req.pipe(forwardRequest);
//   });

//   app.listen(PORT, () => console.log(`Video streaming microservice connected to port ${PORT}`));
// };

function sendViewedMessage(videoPath: String) {
  const postOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const body = JSON.stringify({ videoPath });

  const req = http.request('http://history/viewed', postOptions);

  req.on('close', () => console.log(`Sent "viewed" message to history microservice.`));
  req.on('error', (err) => {
    console.log('Failed to send "viewed" message');
    console.error(err && err.stack || err);
  });

  req.write(body);
  req.end();
};

async function main() {

  const app: express.Express = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/video", async (req, res) => { // Route for streaming video.
      
      const videoPath = "./videos/SampleVideo_1280x720_1mb.mp4";
      const stats = await fs.promises.stat(videoPath);
  
      res.writeHead(200, {
          "Content-Length": stats.size,
          "Content-Type": "video/mp4",
      });

      fs.createReadStream(videoPath).pipe(res);
  });

  app.listen(PORT, () => {
      console.log("Microservice online.");
  });
}

main()
  .catch(err => {
    console.log('Video streaming microservice failed to start.');
    console.error(err && err.stack || err);
  });


