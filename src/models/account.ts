import mongoose from "mongoose";
import { IAccount } from "../types/model";

const accountSchema = new mongoose.Schema({
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
    postedImages: {
        type: [String],
        required: true,
        default: [],
    },
    postedVideos: {
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
export default mongoose.model<IAccount>("Account", accountSchema);
