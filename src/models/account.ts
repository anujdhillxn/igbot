import mongoose from "mongoose";
import { IAccount, IAccountModel, IImageMeta } from "../types/model";

const imageMetaSchema: mongoose.Schema<IImageMeta> = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    posted: {
        type: Boolean,
        required: true,
        default: false,
    },
});

const accountSchema: mongoose.Schema<IAccount> = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        required: true,
        default: false,
    },
    images: {
        type: [imageMetaSchema],
        required: true,
        default: [],
    },
    videos: {
        type: [String],
        required: true,
        default: [],
    },
    hashtags: {
        type: String,
        required: false,
        default: "",
    },
});
export default mongoose.model<IAccount, IAccountModel>(
    "Account",
    accountSchema
);
