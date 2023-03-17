import express, { Request, Response, NextFunction } from 'express';
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import dotenv from 'dotenv';

dotenv.config();

const app: express.Express = express();
const PORT = process.env.PORT || 3000;
const STORAGE_ACCOUNT_NAME = process.env.STORAGE_ACCOUNT_NAME;
const STORAGE_ACCESS_KEY = process.env.STORAGE_ACCESS_KEY;


const createBlobService = () => {
    const sharedKeyCredential = new StorageSharedKeyCredential(STORAGE_ACCOUNT_NAME, STORAGE_ACCESS_KEY);
    const blobService = new BlobServiceClient(`https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`, sharedKeyCredential);

    return blobService;
};

app.get('/video', async(req: Request, res: Response) => {
    let { path } = req.query;
    path = path.toString();

    const containerName = 'videos';
    const blobService = createBlobService();
    const containerClient = blobService.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(path);

    const properties = await blobClient.getProperties();

    res.writeHead(200, {
        'Content-Length': properties.contentLength,
        'Content-Type': 'video/mp4',
    });

    const response = await blobClient.download();
    response.readableStreamBody.pipe(res);
});

app.listen(PORT, () => console.log(`Azure storage microservice running on port ${PORT}`));

