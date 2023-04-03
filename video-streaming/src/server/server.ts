import express, { Request, Response } from 'express';
import http, { IncomingHttpHeaders } from "http";
import amqp from 'amqplib';
import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';

import dotenv from 'dotenv';

dotenv.config();

if (!process.env.PORT) throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.");
if (!process.env.RABBIT) throw new Error("Please specify the name of the RabbitMQ host using environment variable RABBIT");

const PORT: number | string = process.env.PORT || 3000;
const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
const VIDEO_STORAGE_PORT = parseInt(process.env.VIDEO_STORAGE_PORT);
const RABBIT = process.env.RABBIT;

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

function sendViewedMessage(messageChannel, videoPath: string) {
  console.log(`Publishing message on "viewed" queue.`);
  
  const msg = JSON.stringify({ videoPath });
  messageChannel.publish('viewed', '', Buffer.from(msg));
};

async function main(): Promise<void> {

  const app: express.Express = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const messagingConnection = await amqp.connect(RABBIT);
  const messageChannel = await messagingConnection.createChannel();

  await messageChannel.assertExchange('viewed', 'fanout');

  app.get('/', (req: Request, res: Response) => res.send('Hello World'));

  app.get('/live', (req: Request, res: Response) => {
    res.sendStatus(200);
  });

  app.get("/video", async (req: Request, res: Response) => { // Route for streaming video.
      
      const videoPath = "./videos/SampleVideo_1280x720_1mb.mp4";
      const stats = await fs.promises.stat(videoPath);
  
      res.writeHead(200, {
          "Content-Length": stats.size,
          "Content-Type": "video/mp4",
      });

      fs.createReadStream(videoPath).pipe(res);

      sendViewedMessage(messageChannel, videoPath);
  });

  app.listen(PORT, () => {
      console.log("Video-streaming microservice online.");
  });
};

main()
  .catch(err => {
    console.log('Video streaming microservice failed to start.');
    console.error(err && err.stack || err);
  });

export default main;


