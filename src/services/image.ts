import axios from "axios";
import Canvas from "canvas";
import sharp from "sharp";
import * as path from "path";
import { IImage } from "../types/model";
import { ImageModel } from "../models";
import { COMPARISON_THRESHOLD } from "./utils";
import ssim from "ssim.js";

export const IMAGES_DIR = path.resolve("./media/images");

export const insertImage = async (
    name: string,
    blob: Buffer
): Promise<IImage> => {
    const image = await new ImageModel({ name, blob }).save();
    return image;
};

export const getImage = async (name: string): Promise<Buffer | undefined> => {
    const image = await ImageModel.findOne({ name });
    return image?.blob;
};

export const downloadImage = async (url: string): Promise<Buffer> => {
    try {
        const response = await axios.get(url, { responseType: "arraybuffer" });
        const image = sharp(response.data);
        const metadata = await image.metadata();
        if (
            metadata.height &&
            metadata.height >= 100 &&
            metadata.width &&
            metadata.width >= 100
        ) {
            const resizedImage = await image
                .resize(720, 720, { fit: "fill" })
                .toBuffer();
            return resizedImage;
        } else {
            throw new Error(
                `Image too small ${metadata.height}x${metadata.width}`
            );
        }
    } catch (error) {
        console.error("Error occurred while downloading the image:", error);
        throw new Error("Error");
    }
};

export const loadImage = async (data: Buffer) => {
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

export const matchesAnyImage = async (
    data1: Buffer,
    otherImageNames: string[]
): Promise<boolean> => {
    const img1 = await loadImage(data1);
    for (const otherName of otherImageNames) {
        const otherImage = await getImage(otherName);
        if (otherImage) {
            const img2 = await loadImage(otherImage);
            const { mssim } = ssim(img1, img2);
            if (mssim >= COMPARISON_THRESHOLD) {
                return true;
            }
        }
    }
    return false;
};
