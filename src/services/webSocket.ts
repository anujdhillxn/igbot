import ws, { WebSocket } from "ws";
import http from "http";
import { IAgent } from "../types/logic";
import { createNewMonitor } from "./agent";

export const instantiateWebSocketServer = (
    server: http.Server,
    agents: Record<string, IAgent>
) => {
    const wss = new WebSocket.Server({ server });
    wss.on("connection", (ws: WebSocket, req) => {
        const pathname = new URL(
            req.url ? req.url : "",
            `http://${req.headers.host}`
        ).pathname;
        createNewMonitor(agents, ws, pathname.split("/").slice(-1)[0]);
    });
};
