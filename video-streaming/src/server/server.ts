import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// if (!process.env.PORT) throw new Error('Please specify the port number [CA] for the HTTP server with the environment variable PORT.');
const PORT: number | string = process.env.PORT || 3000;

const isDev = process.env.NODE_ENV === 'development';

const videoPath = isDev
  ? path.resolve(__dirname, '../../assets/videos/SampleVideo_1280x720_1mb.mp4') 
  : path.resolve(__dirname, '../assets/videos/SampleVideo_1280x720_1mb.mp4');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req: Request, res: Response) => res.send('Hello World'));

app.get('/videos', async (req: Request, res: Response) => {
    const stats = await fs.promises.stat(videoPath);

    res.writeHead(200, {
        'Content-Length': stats.size,
        'Content-Type': 'video/mp4',
    });

    fs.createReadStream(videoPath).pipe(res);
});



app.listen(PORT, () => console.log(`Connected to port ${PORT}, path is ${__dirname}`));