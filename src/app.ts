import express, { Application } from "express";
import routes from "./routes";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

export default app;
