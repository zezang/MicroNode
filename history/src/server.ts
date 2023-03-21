import express, { Request, Response, NextFunction } from 'express';
import amqp from 'amqplib';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.PORT) throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.");
if (!process.env.DBHOST) throw new Error("Please specify the databse host using environment variable DBHOST.");
if (!process.env.DBNAME) throw new Error("Please specify the name of the database using environment variable DBNAME");

const PORT = process.env.PORT;
const DBHOST: string = process.env.DBHOST;
const DBNAME: string = process.env.DBNAME;
const RABBIT = process.env.RABBIT;

async function main() {
    const app: express.Express = express();
    app.use(express.json());

    const client = await MongoClient.connect(DBHOST);
    const db = client.db(DBNAME);

    const videosCollection = db.collection('videos');

    console.log(`Connecting to RabbitMQ at ${RABBIT}`);
    const messagingConnection = await amqp.connect(RABBIT);
    console.log('Connected to RabbitMQ');

    const messageChannel = await messagingConnection.createChannel();

    async function consumeViewedMessage(msg) {
        const parsedMsg = JSON.parse(msg.content.toString());
        await videosCollection.insertOne({ videoPath: parsedMsg.videoPath});

        console.log('Acknowledging message was handled.');
        messageChannel.ack(msg);
    };

    await messageChannel.assertQueue('viewed', {});
    await messageChannel.consume('viewed', consumeViewedMessage);

    app.get('/history', async(req: Request, res: Response) => {
        const skip: number = Number(req.query.skip);
        const limit: number = Number(req.query.limit);
        const documents = await videosCollection.find()
            .skip(skip)
            .limit(limit)
            .toArray();
        
        res.json({ history: documents });
    });

    app.listen(PORT, () => console.log('History microservice online'))
};

main()
  .catch(err => {
      console.log('History microservice error');
      console.error(err && err.stack | err);
  });