import * as path from "path";
import axios from "axios";
import * as fs from "fs";

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
