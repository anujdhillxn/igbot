import express, { Request, Response } from "express";
import {
    setupPostJobs,
    setupReelJobs,
    setupScrapeJobs,
    stopJob,
} from "../services/job";

const router = express.Router();

router.post("/stop", async (req: Request, res: Response) => {
    try {
        if (!req.app.locals.agents[req.body.username]) {
            return res.status(404).json({ message: "Agent not running." });
        }
        return res
            .status(200)
            .json(
                stopJob(req.app.locals.agents, req.body.username, req.body.id)
            );
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/setupPostJobs", async (req: Request, res: Response) => {
    setupPostJobs(
        req.app.locals.agents,
        req.body.username,
        req.body.imagesPerPostLow,
        req.body.imagesPerPostHigh,
        req.body.intervalSeconds
    );
    res.status(200).json("Post jobs are up.");
});

router.post("/setupReelJobs", async (req: Request, res: Response) => {
    setupReelJobs(
        req.app.locals.agents,
        req.body.username,
        req.body.intervalSeconds
    );
    res.status(200).json("Post jobs are up.");
});

router.post("/setupScrapeJobs", async (req: Request, res: Response) => {
    setupScrapeJobs(
        req.app.locals.agents,
        req.body.username,
        req.body.intervalSeconds
    );
    res.status(200).json("Scrape jobs are up.");
});

router.post("/customtask", async (req: Request, res: Response) => {
    //Custom task
});

export default router;
