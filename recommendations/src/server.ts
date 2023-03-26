import express from 'express';
import { MongoClient } from 'mongodb';
import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.PORT) throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.");
if (!process.env.DBHOST) throw new Error("Please specify the databse host using environment variable DBHOST.");
if (!process.env.DBNAME) throw new Error("Please specify the name of the database using environment variable DBNAME");
if (!process.env.RABBIT) throw new Error("Please specify the name of the RabbitMQ host using environment variable RABBIT");

const PORT = process.env.PORT;
const DBHOST = process.env.DBHOST;
const DBNAME = process.env.DBNAME;
const RABBIT = process.env.RABBIT;

async function main(): Promise<void> {
    const app: express.Express = express();
    app.use(express.json());

    const client = await MongoClient.connect(DBHOST);
    const db = client.db(DBNAME);
    const videosCollection = db.collection('videos');

    const messagingConnection = amqp.connect(RABBIT);
    const messageChannel = messagingConnection.createChannel();

    async function consumeViewedMessage(msg) {
        const parsedMsg = JSON.parse(msg.content.toString());

        console.log(JSON.stringify(parsedMsg, null, 4));
        messageChannel.ack(msg);
    };

    await messageChannel.assertExchange('viewed', 'fanout');
    const { queue } = await messageChannel.assertQueue('', { exclusive: true });

    await messageChannel.bindQueue(queue, 'viewed', '');
    await messageChannel.consume(queue, consumeViewedMessage);

    app.listen(PORT, () => console.log('Reccomendations microservice listening on port ', PORT));
};

main()
    .catch(err => {
        console.log('Error with recommendations microservice listening.');
        console.error(err && err.stack || err);
    });