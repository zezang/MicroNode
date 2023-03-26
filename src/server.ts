import express, { Request, Response } from 'express';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.PORT) throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.");
const PORT: number | string = process.env.PORT || 3000;

const app: express.Express = express();

app.get('/video', async(req: Request, res: Response) => {
  const videoPath = './videos/SampleVideo_1280x720_1mb.mp4';
  const stats = await fs.promises.stat(videoPath);

  res.writeHead(200, {
    'Content-Length': stats.size,
    'Content-Type': 'video/mp4',
  });

  fs.createReadStream(videoPath).pipe(res);
});

app.listen(PORT, () => console.log('Video microservice listening on port: ', PORT));




