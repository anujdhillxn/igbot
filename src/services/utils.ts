import * as path from "path";
import axios from "axios";
import Canvas from "canvas";
import sharp from "sharp";
import * as fs from "fs";
import ssim from "ssim.js";

export const sleep = (seconds: number) =>
    new Promise((r) => setTimeout(r, seconds * 1000));

export const randomIntegerBetween = (low: number, high: number) => {
    //random in range [low, high]
    return low + Math.floor(Math.random() * (high - low + 1));
};

export const downloadImage = async (url: string, outputFilePath: string) => {
    try {
        const response = await axios.get(url, { responseType: "arraybuffer" });
        const outputDirectory = path.dirname(outputFilePath);
        fs.mkdirSync(outputDirectory, { recursive: true });
        await sharp(response.data)
            .resize(720, 720, { fit: "fill" })
            .toFile(outputFilePath);
    } catch (error) {
        console.error("Error occurred while downloading the image:", error);
    }
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

export const IMAGES_DIR = path.resolve("./media/images");
export const VIDEOS_DIR = path.resolve("./media/videos");
export const COMPARISON_THRESHOLD = 0.45;

export const loadImage = async (imagePath: string) => {
    const data = fs.readFileSync(imagePath);
    const img = await Canvas.loadImage(data);
    const canvas = Canvas.createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        0,
        0,
        img.width,
        img.height
    );

    return ctx.getImageData(0, 0, img.width, img.height);
};

export const matchesOldImage = async (
    imagePath: string,
    username: string
): Promise<boolean> => {
    const dirPath = path.join(IMAGES_DIR, username);
    const imageNames = fs.readdirSync(dirPath);
    const img1 = await loadImage(imagePath);
    for (const otherName of imageNames) {
        const otherPath = path.join(dirPath, otherName);
        if (imagePath !== otherPath) {
            const img2 = await loadImage(otherPath);
            const { mssim } = ssim(img1, img2);
            if (mssim >= COMPARISON_THRESHOLD) {
                return true;
            }
        }
    }
    return false;
};

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
