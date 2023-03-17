"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
// if (!process.env.PORT) throw new Error('Please specify the port number [CA] for the HTTP server with the environment variable PORT.');
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV === 'development';
const videoPath = isDev
    ? path_1.default.resolve(__dirname, '../../assets/videos/SampleVideo_1280x720_1mb.mp4')
    : path_1.default.resolve(__dirname, '../assets/videos/SampleVideo_1280x720_1mb.mp4');
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/', (req, res) => res.send('Hello World'));
app.get('/videos', async (req, res) => {
    const stats = await fs_1.default.promises.stat(videoPath);
    res.writeHead(200, {
        'Content-Length': stats.size,
        'Content-Type': 'video/mp4',
    });
    fs_1.default.createReadStream(videoPath).pipe(res);
});
app.listen(PORT, () => console.log(`Connected to port ${PORT}`));
