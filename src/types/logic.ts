import * as puppeteer from "puppeteer";
import * as ws from "ws";
import * as http from "http";
declare global {
    namespace Express {
        // These open interfaces may be extended in an application-specific manner via declaration merging.
        // See for example method-override.d.ts (https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/method-override/index.d.ts)
        interface Locals {
            agents: Record<string, IAgent>;
        }
    }
}

export interface IAgent {
    browser: puppeteer.Browser;
    status: AgentStatus;
    headless: boolean;
    jobs: IJob[];
}

export interface IJob {
    id: string;
    type: JobType;
    timeout: NodeJS.Timeout;
    expectedExecution: Date;
}

export enum JobType {
    POST = "POST",
    FOLLOW = "FOLLOW",
    SCRAPE = "SCRAPE",
    REEL = "REEL",
    HEALTH = "HEALTH",
}

export enum AgentStatus {
    FOLLOWING = "FOLLOWING",
    POSTING = "POSTING",
    SCRAPING = "SCRAPING",
    IDLE = "IDLE",
    ERROR = "ERROR",
    STARTING = "STARTING",
}

export interface IMessage {
    code: number;
    message?: string;
}
