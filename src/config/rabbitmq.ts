import amqp, { Channel } from "amqplib";
import dotenv from "dotenv";

dotenv.config();

let channel: Channel;

export const connectRabbitMQ = async () => {
    if (!process.env.RABBITMQ_URL) {
        throw new Error("RABBITMQ_URL is not defined in environment variables");
    }
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(process.env.TODO_QUEUE!, { durable: true });
    console.log("RabbitMQ connected");
};

export const getChannel = () => {
    if (!channel) throw new Error("RabbitMQ channel not initialized");
    return channel;
};