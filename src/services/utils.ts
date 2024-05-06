import * as path from "path";
import axios from "axios";
import * as fs from "fs";
import { Page } from "puppeteer";

export const sleep = (seconds: number) =>
    new Promise((r) => setTimeout(r, seconds * 1000));

export const randomIntegerBetween = (low: number, high: number) => {
    //random in range [low, high]
    return low + Math.floor(Math.random() * (high - low + 1));
};

export const downloadVideo = async (url: string, outputPath: string) => {
    try {
        const outputDirectory = path.dirname(outputPath);
        fs.mkdirSync(outputDirectory, { recursive: true });
        const response = await axios.get(url, { responseType: "stream" });
        const writer = fs.createWriteStream(outputPath);
        response.data.pipe(writer);
        return new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });
    } catch (error) {
        console.error("Error downloading video:", error);
    }
};

export const deleteFiles = (filePaths: string[]) => {
    filePaths.forEach((filePath) => {
        fs.unlink(filePath, (error) => {
            if (error) {
                console.error(
                    `Error occurred while deleting ${filePath}:`,
                    error.message
                );
            }
        });
    });
};
export const VIDEOS_DIR = path.resolve("./media/videos");
export const COMPARISON_THRESHOLD = 0.45;
export const MAX_FOLDER_SIZE = 500;

export const matchesOldVideo = (
    videoDir: string,
    videoName: string
): boolean => {
    return (
        fs.readdirSync(videoDir).findIndex((name) => name === videoName) !== -1
    );
};

export const getVideoName = (videoUrl: string): string => {
    const urlParts = videoUrl.split("/");
    return urlParts[urlParts.length - 1] + ".mp4";
};

export const installMouseHelper = async (page: Page) => {
    await page.evaluateOnNewDocument(() => {
        // Install mouse helper only for top-level frame.
        if (window !== window.parent) return;
        window.addEventListener(
            "DOMContentLoaded",
            () => {
                const box = document.createElement("puppeteer-mouse-pointer");
                const styleElement = document.createElement("style");
                styleElement.innerHTML = `
            puppeteer-mouse-pointer {
              pointer-events: none;
              position: absolute;
              top: 0;
              z-index: 99999999999999999;
              left: 0;
              width: 20px;
              height: 20px;
              background: rgba(0,0,0,.4);
              border: 1px solid white;
              border-radius: 10px;
              margin: -10px 0 0 -10px;
              padding: 0;
              transition: background .2s, border-radius .2s, border-color .2s;
            }
            puppeteer-mouse-pointer.button-1 {
              transition: none;
              background: rgba(0,0,0,0.9);
            }
            puppeteer-mouse-pointer.button-2 {
              transition: none;
              border-color: rgba(0,0,255,0.9);
            }
            puppeteer-mouse-pointer.button-3 {
              transition: none;
              border-radius: 4px;
            }
            puppeteer-mouse-pointer.button-4 {
              transition: none;
              border-color: rgba(255,0,0,0.9);
            }
            puppeteer-mouse-pointer.button-5 {
              transition: none;
              border-color: rgba(0,255,0,0.9);
            }
          `;
                document.head.appendChild(styleElement);
                document.body.appendChild(box);
                document.addEventListener(
                    "mousemove",
                    (event) => {
                        box.style.left = event.pageX + "px";
                        box.style.top = event.pageY + "px";
                        updateButtons(event.buttons);
                    },
                    true
                );
                document.addEventListener(
                    "mousedown",
                    (event) => {
                        updateButtons(event.buttons);
                        box.classList.add("button-" + event.which);
                    },
                    true
                );
                document.addEventListener(
                    "mouseup",
                    (event) => {
                        updateButtons(event.buttons);
                        box.classList.remove("button-" + event.which);
                    },
                    true
                );
                function updateButtons(buttons: number) {
                    for (let i = 0; i < 5; i++)
                        box.classList.toggle(
                            "button-" + i,
                            Boolean(buttons & (1 << i))
                        );
                }
            },
            false
        );
    });
};
