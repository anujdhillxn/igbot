import { ElementHandle } from "puppeteer";
import { AgentStatus, IAgent, IMessage } from "../types/logic";
import {
    IMAGES_DIR,
    VIDEOS_DIR,
    deleteFiles,
    downloadImage,
    downloadVideo,
    getVideoName,
    matchesOldImage,
    matchesOldVideo,
    randomIntegerBetween,
    sleep,
} from "./utils";
import puppeteer from "puppeteer";
import { readdirSync } from "fs";
import * as path from "path";
import { editAccount, findAccount } from "./account";
import { randomUUID } from "crypto";
import { generateCaption } from "./text";

export const setAgentProperties = (
    agents: Record<string, IAgent>,
    username: string,
    newValue: Partial<IAgent>
) => {
    agents[username] = {
        ...agents[username],
        ...newValue,
    };
};

export const startAgent = async (
    agents: Record<string, IAgent>,
    username: string,
    headless: boolean
): Promise<IMessage> => {
    const account = await findAccount({ username });
    if (account === null) {
        return { code: 1, message: "Account not found." };
    }
    if (username in agents) {
        if (agents[username].status !== AgentStatus.ERROR)
            return { code: 0, message: "Agent running already." };
    }
    const browser = await puppeteer.launch({
        headless: headless ? "new" : false,
        executablePath:
            process.env.NODE_ENV === "production"
                ? process.env.PUPPETEER_EXECUTABLE_PATH
                : puppeteer.executablePath(),
    });
    const [page] = await browser.pages();
    setAgentProperties(agents, username, {
        browser,
        status: AgentStatus.STARTING,
        headless,
        jobs: [],
    });
    try {
        await page.goto("https://instagram.com");
        await page.waitForSelector("input[name=username]");
        await page.type("input[name=username]", username);
        await page.type("input[name=password]", account.password);
        await page.click("button[type=submit]");
        try {
            await page.waitForXPath('//*[text()="Not Now"]');
            const [saveInfoButton] = await page.$x('//*[text()="Not Now"]');
            await (saveInfoButton as ElementHandle<Element>).click();
        } catch (_e) {}
        try {
            await page.waitForXPath('//*[text()="Not Now"]');
            const [turnNotifButton] = await page.$x('//*[text()="Not Now"]');
            await (turnNotifButton as ElementHandle<Element>).click();
        } catch (_e) {}
        try {
            await page.waitForXPath('//*[text()="Not Now"]');
            const [turnNotifButton] = await page.$x('//*[text()="Not Now"]');
            await (turnNotifButton as ElementHandle<Element>).click();
        } catch (_e) {}
        return { code: 0, message: "Agent started." };
    } catch (e) {
        console.log(e);
        browser.close();
        delete agents[username];
        return { code: 1, message: "Error while starting agent." };
    } finally {
        if (username in agents) {
            setAgentProperties(agents, username, {
                status: AgentStatus.IDLE,
            });
        }
    }
};

export const startFollowing = async (
    agents: Record<string, IAgent>,
    username: string,
    required: number
) => {
    const { browser, status } = agents[username];
    if (status === AgentStatus.IDLE) {
        let followed = 0;
        try {
            const [page] = await browser.pages();
            setAgentProperties(agents, username, {
                status: AgentStatus.FOLLOWING,
            });
            while (followed < required) {
                await page.goto("https://instagram.com");
                await page.waitForXPath('//a[contains(@href, "liked_by")]');
                const [likes] = await page.$x(
                    '//a[contains(@href, "liked_by")]'
                );
                await (likes as ElementHandle<Element>).click();
                await sleep(3);
                const followButtons = await page.$x('//div[text()="Follow"]');
                for (
                    let buttonIndex = 0;
                    buttonIndex < followButtons.length;
                    buttonIndex++
                ) {
                    if (followed === required) return;
                    await followButtons[buttonIndex].evaluate((b) =>
                        (b as any).click()
                    );
                    await sleep(randomIntegerBetween(10, 15));
                    followed++;
                }
            }
        } catch (e) {
            console.log(e);
        } finally {
            setAgentProperties(agents, username, {
                status: AgentStatus.IDLE,
            });
            return {
                code: 0,
                message: `Successfully followed ${followed}/${required}.`,
            };
        }
    } else {
        return {
            code: 1,
            message: `Agent ${username} is not idle.`,
        };
    }
};

export const postImages = async (
    agents: Record<string, IAgent>,
    username: string,
    imagesPerPostLow: number,
    imagesPerPostHigh: number,
    caption?: string
): Promise<IMessage> => {
    try {
        if (!(username in agents)) {
            return {
                code: 1,
                message: `Agent ${username} is not active.`,
            };
        }
    } catch (e) {
        return {
            code: 1,
            message: `Agent ${username} is not active. ${e}`,
        };
    }
    const { browser, status, headless } = agents[username];
    if (status === AgentStatus.IDLE) {
        try {
            const [page] = await browser.pages();
            try {
                await page.goto("https://instagram.com");
            } catch (e) {
                await startAgent(agents, username, headless);
            }
            setAgentProperties(agents, username, {
                status: AgentStatus.POSTING,
            });
            const account = await findAccount({
                username,
            });
            if (account === null) {
                return {
                    code: 1,
                    message: `Account not found.`,
                };
            }
            const userImagesDir = path.join(IMAGES_DIR, username);
            const count = randomIntegerBetween(
                imagesPerPostLow,
                imagesPerPostHigh
            );
            const images = readdirSync(userImagesDir)
                .filter(
                    (name) =>
                        account.postedImages.findIndex(
                            (image) => image === name
                        ) === -1
                )
                .map((name) => path.join(userImagesDir, name))
                .slice(0, Math.min(10, count));
            if (images.length <= 0) {
                return {
                    code: 0,
                    message: `No images found.`,
                };
            }
            console.log("Trying to post", images);
            await page.goto("https://instagram.com");
            await page.waitForSelector('svg[aria-label="New post"]');
            await page.click('svg[aria-label="New post"]');
            await page.waitForXPath(
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'select from computer')]"
            );
            const [fileButton] = await page.$x(
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'select from computer')]"
            );
            const [fileChooser] = await Promise.all([
                page.waitForFileChooser(),
                (fileButton as any).click(),
            ]);
            await fileChooser.accept(images);
            await page.waitForXPath('//*[text()="Next"]');
            const [nextButton1] = await page.$x('//*[text()="Next"]');
            await (nextButton1 as any).click();
            await page.waitForXPath('//*[text()="Next"]');
            const [nextButton2] = await page.$x('//*[text()="Next"]');
            await (nextButton2 as any).click();
            await page.waitForSelector("div[aria-label='Write a caption...'");
            await page.type(
                "div[aria-label='Write a caption...'",
                caption ? caption : await generateCaption(images.length > 1)
            );
            if (account.hashtags) {
                await page.type(
                    "div[aria-label='Write a caption...'",
                    `\n\n\n\n\n${account.hashtags}`
                );
            }
            await page.waitForXPath('//*[text()="Share"]');
            const [shareButton] = await page.$x('//*[text()="Share"]');
            await (shareButton as any).click();
            await page.waitForXPath('//*[text()="Post shared"]');
            await page.click('svg[aria-label="Close"]');
            await editAccount(username, {
                postedImages: [
                    ...account.postedImages,
                    ...images.map((imagePath) => path.basename(imagePath)),
                ],
            });
            return {
                code: 0,
                message: `Successfully posted the images.`,
            };
        } catch (e) {
            console.log(`Error while posting images from ${username}. ${e}`);
            return {
                code: 1,
                message: `Unable to post. ${e}`,
            };
        } finally {
            setAgentProperties(agents, username, {
                status: AgentStatus.IDLE,
            });
        }
    } else {
        return {
            code: 1,
            message: `Agent ${username} is not idle.`,
        };
    }
};

export const postVideo = async (
    agents: Record<string, IAgent>,
    username: string,
    caption?: string
): Promise<IMessage> => {
    try {
        if (!(username in agents)) {
            return {
                code: 1,
                message: `Agent ${username} is not active.`,
            };
        }
    } catch (e) {
        return {
            code: 1,
            message: `Agent ${username} is not active. ${e}`,
        };
    }
    const { browser, status } = agents[username];
    const [page] = await browser.pages();
    if (status === AgentStatus.IDLE) {
        try {
            setAgentProperties(agents, username, {
                status: AgentStatus.POSTING,
            });
            const account = await findAccount({
                username,
            });
            if (account === null) {
                return {
                    code: 1,
                    message: `Account not found.`,
                };
            }
            await page.goto("https://instagram.com");
            await page.waitForSelector('svg[aria-label="New post"]');
            await page.click('svg[aria-label="New post"]');
            await page.waitForXPath(
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'select from computer')]"
            );
            const [fileButton] = await page.$x(
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'select from computer')]"
            );
            const [fileChooser] = await Promise.all([
                page.waitForFileChooser(),
                (fileButton as any).click(),
            ]);
            const userVideosDir = path.join(VIDEOS_DIR, username);
            const videos = readdirSync(userVideosDir)
                .filter(
                    (name) =>
                        account.postedVideos.findIndex(
                            (video) => video === name
                        ) === -1
                )
                .map((name) => path.join(userVideosDir, name))
                .slice(0, 1);
            if (videos.length <= 0) {
                return {
                    code: 0,
                    message: `No videos found.`,
                };
            }
            await fileChooser.accept(videos);
            await page.waitForXPath('//*[text()="Next"]');
            const [nextButton1] = await page.$x('//*[text()="Next"]');
            await (nextButton1 as any).click();
            await sleep(3);
            await page.waitForXPath('//*[text()="Next"]');
            const [nextButton2] = await page.$x('//*[text()="Next"]');
            await (nextButton2 as any).click();
            await sleep(3);
            await page.waitForSelector("div[aria-label='Write a caption...'");
            await page.type(
                "div[aria-label='Write a caption...'",
                caption ? caption : `Follow @${account.username}`
            );
            if (account.hashtags) {
                await page.type(
                    "div[aria-label='Write a caption...'",
                    `\n\n\n\n\n${account.hashtags}`
                );
            }
            await page.waitForXPath('//*[text()="Share"]');
            const [shareButton] = await page.$x('//*[text()="Share"]');
            await (shareButton as any).click();
            await page.waitForXPath('//*[text()="Post shared"');
            await page.click('svg[aria-label="Close"]');
            await editAccount(username, {
                postedVideos: [
                    ...account.postedVideos,
                    ...videos.map((videoPath) => path.basename(videoPath)),
                ],
            });
            return {
                code: 0,
                message: `Successfully posted the video.`,
            };
        } catch (e) {
            console.log(e);
            await page.screenshot({ path: "testresult.png", fullPage: true });
            return {
                code: 1,
                message: `Unable to post. ${e}`,
            };
        } finally {
            setAgentProperties(agents, username, {
                status: AgentStatus.IDLE,
            });
        }
    } else {
        return {
            code: 1,
            message: `Agent ${username} is not idle.`,
        };
    }
};

export const scrapePosts = async (
    agents: Record<string, IAgent>,
    username: string
): Promise<IMessage> => {
    try {
        if (!(username in agents)) {
            return {
                code: 1,
                message: `Agent ${username} is not active.`,
            };
        }
    } catch (e) {
        return {
            code: 1,
            message: `Agent ${username} is not active. ${e}`,
        };
    }
    const { browser, status, headless } = agents[username];
    let scrapeCount = 0;
    if (status === AgentStatus.IDLE) {
        try {
            setAgentProperties(agents, username, {
                status: AgentStatus.SCRAPING,
            });
            const [page] = await browser.pages();
            try {
                await page.goto("https://instagram.com");
            } catch (e) {
                await startAgent(agents, username, headless);
            }
            await sleep(5);
            const posts = await page.$$("article");
            for (const post of posts) {
                const followButton = await post
                    .$eval(
                        'div:contains("Follow")',
                        (button) => button.textContent
                    )
                    .catch(() => null);
                const sponsoredSpan = await post
                    .$eval(
                        'span:contains("Sponsored")',
                        (span) => span.textContent
                    )
                    .catch(() => null);
                if (followButton === null && sponsoredSpan === null) {
                    try {
                        const videoUrl = await post.$eval("video", (el) =>
                            el.getAttribute("src")
                        );
                        if (videoUrl) {
                            const videoPath = path.join(
                                VIDEOS_DIR,
                                username,
                                getVideoName(videoUrl)
                            );
                            if (
                                !matchesOldVideo(
                                    path.join(VIDEOS_DIR, username),
                                    getVideoName(videoUrl)
                                )
                            ) {
                                await downloadVideo(videoUrl, videoPath);
                            }
                        }
                    } catch (e) {
                        try {
                            const imageUrl = await post.$eval(
                                'img[alt*="May be a meme"]',
                                (el) => el.getAttribute("src")
                            );
                            if (imageUrl) {
                                const imagePath = path.join(
                                    IMAGES_DIR,
                                    username,
                                    randomUUID() + ".jpg"
                                );
                                await downloadImage(imageUrl, imagePath);
                                scrapeCount++;
                                if (
                                    await matchesOldImage(imagePath, username)
                                ) {
                                    deleteFiles([imagePath]);
                                    scrapeCount--;
                                }
                            }
                        } catch (e) {}
                    }
                }
            }
            return {
                code: 0,
                message: `Successfully scraped ${scrapeCount} posts for ${username}.`,
            };
        } catch (e) {
            console.log(`Unable to scrape from ${username}. ${e}`);
            return {
                code: 1,
                message: `Unable to scrape. ${e}`,
            };
        } finally {
            setAgentProperties(agents, username, {
                status: AgentStatus.IDLE,
            });
        }
    } else {
        return {
            code: 1,
            message: `Agent ${username} is not idle.`,
        };
    }
};
