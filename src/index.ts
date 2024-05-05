import express from "express";
import WebSocket from "ws";
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { DEV_DATABASE_URL, DEV_PORT } from "./config";
import {
    accountsRouter,
    agentsRouter,
    imagesRouter,
    jobsRouter,
    textsRouter,
} from "./routes";
import { instantiateWebSocketServer } from "./services/webSocket";
dotenv.config();
const app = express();
app.use(express.json());

const databaseUrl: string = process.env.DATABASE_URL || DEV_DATABASE_URL;
const port: string = process.env.PORT || DEV_PORT;
mongoose.set("strictQuery", false);
mongoose.connect(databaseUrl);
const db: mongoose.Connection = mongoose.connection;
db.on("error", () => console.error("Error connecting to DB"));
db.once("open", () => console.log("Connected to Database"));

app.use("/accounts", accountsRouter);
app.use("/agents", agentsRouter);
app.use("/jobs", jobsRouter);
app.use("/texts", textsRouter);
app.use("/images", imagesRouter);

const server = http.createServer(app);

app.locals.agents = {};
instantiateWebSocketServer(server, app.locals.agents);

server.listen(port, async () => {
    console.log(`Server running on port ${port}`);
});
