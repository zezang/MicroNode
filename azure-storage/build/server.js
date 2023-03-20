"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const storage_blob_1 = require("@azure/storage-blob");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
if (!process.env.STORAGE_ACCOUNT_NAME || !process.env.STORAGE_ACCESS_KEY)
    throw new Error('Missing necessary environment variables');
const STORAGE_ACCOUNT_NAME = process.env.STORAGE_ACCOUNT_NAME;
const STORAGE_ACCESS_KEY = process.env.STORAGE_ACCESS_KEY;
const createBlobService = () => {
    const sharedKeyCredential = new storage_blob_1.StorageSharedKeyCredential(STORAGE_ACCOUNT_NAME, STORAGE_ACCESS_KEY);
    const blobService = new storage_blob_1.BlobServiceClient(`https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`, sharedKeyCredential);
    return blobService;
};
app.get('/video', async (req, res) => {
    let { path } = req.query;
    if (!path)
        return res.status(404).send('Invalid Request');
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
    if (response.readableStreamBody)
        response.readableStreamBody.pipe(res);
});
app.listen(PORT, () => console.log(`Azure storage microservice running on port ${PORT}`));
