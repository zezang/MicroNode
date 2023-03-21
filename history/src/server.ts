import express, { Request, Response, NextFunction } from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.PORT) throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.");
if (!process.env.DBHOST) throw new Error("Please specify the databse host using environment variable DBHOST.");
if (!process.env.DBNAME) throw new Error("Please specify the name of the database using environment variable DBNAME");

const PORT = process.env.PORT;
const DBHOST: string = process.env.DBHOST;
const DBNAME: string = process.env.DBNAME;

async function main() {
    const app: express.Express = express();
    app.use(express.json());

    const client = await MongoClient.connect(DBHOST);
    const db = client.db(DBNAME);

    const videosCollection = db.collection('videos');

    app.post('/viewed', async(req: Request, res: Response) => {
        const { videoPath } = req.body;
        await videosCollection.insertOne({ videoPath });

        console.log(`Added ${videoPath} to history.`);
        res.sendStatus(200);
    });

    app.listen(PORT, () => console.log('History microservice online'))
};

main()
  .catch(err => {
      console.log('History microservice error');
      console.error(err && err.stack | err);
  });