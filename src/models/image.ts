import mongoose from "mongoose";
import { IImage, IImageModel } from "../types/model";

const imageSchema: mongoose.Schema<IImage> = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    blob: {
        type: Buffer,
        required: true,
    },
});
export default mongoose.model<IImage, IImageModel>("Image", imageSchema);
