import express, { Request, Response } from "express";
import { IAccount } from "../types/model";
import Account from "../models/account";
import {
    changePageSize,
    createNewMonitor,
    getSnapshot,
    postImages,
    postVideo,
    scrapePosts,
    startAgent,
    startFollowing,
    stopAgent,
} from "../services/agent";
import { findAccount } from "../services/account";

const router = express.Router();

router.get("/status/:username", async (req: Request, res: Response) => {
    try {
        if (!req.app.locals.agents[req.params.username]) {
            return res.status(404).json({ message: "Agent not running." });
        }
        return res.status(200).json({
            ...req.app.locals.agents[req.params.username],
            jobs: req.app.locals.agents[req.params.username].jobs.map((job) => {
                return {
                    id: job.id,
                    type: job.type,
                    expectedExecution: job.expectedExecution,
                };
            }),
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/stop", async (req: Request, res: Response) => {
    try {
        const { message } = await stopAgent(
            req.app.locals.agents,
            req.body.username
        );
        res.status(200).json(message);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/start", async (req: Request, res: Response) => {
    try {
        const { message } = await startAgent(
            req.app.locals.agents,
            req.body.username,
            req.body.headless,
            req.body.width,
            req.body.height
        );
        res.status(200).json(message);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/changePageSize", async (req: Request, res: Response) => {
    try {
        const { message } = await changePageSize(
            req.app.locals.agents,
            req.body.username,
            req.body.width,
            req.body.height
        );
        res.status(200).json(message);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/startFollow", async (req: Request, res: Response) => {
    res.status(200).json(
        await startFollowing(req.app.locals.agents, req.body.username, 10)
    );
});

router.post("/postImages", async (req: Request, res: Response) => {
    res.status(200).json(
        await postImages(
            req.app.locals.agents,
            req.body.username,
            req.body.imagesPerPostLow,
            req.body.imagesPerPostHigh
        )
    );
});

router.post("/postVideo", async (req: Request, res: Response) => {
    res.status(200).json(
        await postVideo(req.app.locals.agents, req.body.username)
    );
});

router.post("/scrapePosts", async (req: Request, res: Response) => {
    res.status(200).json(
        await scrapePosts(req.app.locals.agents, req.body.username)
    );
});

router.get("/snapshot/:username", async (req: Request, res: Response) => {
    res.send(await getSnapshot(req.app.locals.agents, req.params.username));
});

export default router;
