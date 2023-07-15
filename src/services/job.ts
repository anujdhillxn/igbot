import {
    postImages,
    postVideo,
    scrapePosts,
    setAgentProperties,
} from "./agent";
import { IAgent, IMessage, JobType } from "../types/logic";
import { randomUUID } from "crypto";
export const setupPostJobs = async (
    agents: Record<string, IAgent>,
    username: string,
    imagesPerPostLow: number,
    imagesPerPostHigh: number,
    intervalSeconds: number
) => {
    const { code } = await postImages(
        agents,
        username,
        imagesPerPostLow,
        imagesPerPostHigh
    );
    const executeAfter = (code ? 1 : intervalSeconds) * 1000;
    addJobToAgent(
        agents,
        username,
        () =>
            setupPostJobs(
                agents,
                username,
                imagesPerPostLow,
                imagesPerPostHigh,
                intervalSeconds
            ),
        executeAfter,
        randomUUID(),
        JobType.POST
    );
};

export const setupReelJobs = async (
    agents: Record<string, IAgent>,
    username: string,
    intervalSeconds: number
) => {
    const { code } = await postVideo(agents, username);
    const executeAfter = (code ? 1 : intervalSeconds) * 1000;
    addJobToAgent(
        agents,
        username,
        () => setupReelJobs(agents, username, intervalSeconds),
        executeAfter,
        randomUUID(),
        JobType.REEL
    );
};

export const setupScrapeJobs = async (
    agents: Record<string, IAgent>,
    username: string,
    intervalSeconds: number
) => {
    const { code } = await scrapePosts(agents, username);
    const executeAfter = (code ? 5 : intervalSeconds) * 1000;
    addJobToAgent(
        agents,
        username,
        () => setupScrapeJobs(agents, username, intervalSeconds),
        executeAfter,
        randomUUID(),
        JobType.SCRAPE
    );
};

export const addJobToAgent = (
    agents: Record<string, IAgent>,
    username: string,
    callback: () => Promise<void>,
    executeAfter: number,
    id: string,
    type: JobType
) => {
    const timeout = setTimeout(async () => {
        setAgentProperties(agents, username, {
            jobs: agents[username].jobs.filter((job) => id !== job.id),
        });
        await callback();
    }, executeAfter);
    const expectedExecution = new Date(new Date().getTime() + executeAfter);
    setAgentProperties(agents, username, {
        jobs: [
            ...(agents[username]?.jobs ? agents[username].jobs : []),
            {
                id,
                expectedExecution,
                timeout,
                type,
            },
        ],
    });
};

export const stopJob = (
    agents: Record<string, IAgent>,
    username: string,
    id: string
): IMessage => {
    if (!agents[username]) {
        return {
            code: 1,
            message: `Agent ${username} is not running.`,
        };
    }
    const jobs = agents[username].jobs;
    const jobToStop = jobs.find((job) => job.id === id);
    if (jobToStop) {
        clearTimeout(jobToStop.timeout);
        setAgentProperties(agents, username, {
            jobs: agents[username].jobs.filter((job) => id !== job.id),
        });
    }
    return {
        code: 0,
        message: `Job ${id} stopped.`,
    };
};
