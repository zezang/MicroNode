import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const app: express.Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req: Request, res: Response) => res.send('Hello World'));

app.get('/videos', async (req: Request, res: Response) => {
    const videoPath = path.resolve(__dirname, '../../assets/videos/SampleVideo_1280x720_1mb.mp4');
    const stats = await fs.promises.stat(videoPath);

    res.writeHead(200, {
        'Content-Length': stats.size,
        'Content-Type': 'video/mp4',
    });

    fs.createReadStream(videoPath).pipe(res);
});


const PORT: number | string = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Connected to port ${PORT}`));