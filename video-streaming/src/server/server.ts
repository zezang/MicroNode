import express, { Request, Response } from 'express';
import amqp from 'amqplib';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();
export const app: express.Express = express();

if (!process.env.PORT) throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.");
if (!process.env.RABBIT) throw new Error("Please specify the name of the RabbitMQ host using environment variable RABBIT");

const PORT: number | string = process.env.PORT || 3000;
const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
const VIDEO_STORAGE_PORT = parseInt(process.env.VIDEO_STORAGE_PORT);
const RABBIT = process.env.RABBIT;

function sendViewedMessage(messageChannel, videoPath: string) {
  console.log(`Publishing message on "viewed" queue.`);
  
  const msg = JSON.stringify({ videoPath });
  messageChannel.publish('viewed', '', Buffer.from(msg));
};

async function main(): Promise<void> {

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


