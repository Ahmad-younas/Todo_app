import "reflect-metadata";
import { AppDataSource } from "./config/data-source";
import { connectRabbitMQ } from "./config/rabbitmq";
import app from "./app";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Database connected");

        await connectRabbitMQ();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Error starting server:", error);
        process.exit(1);
    }
};

startServer();
