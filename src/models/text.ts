import mongoose from "mongoose";
import { IText, Language, TextType } from "../types/model";

const textSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    textType: {
        type: String,
        enum: TextType,
        default: TextType.CAPTION,
        required: true,
    },
    language: {
        type: String,
        enum: Language,
        default: Language.ENGLISH,
        required: true,
    },
    preferableMonth: {
        type: String,
        required: false,
    },
    preferableDay: {
        type: String,
        required: false,
    },
    preferableTimeStart: {
        type: Number,
        required: false,
    },
    preferableTimeEnd: {
        type: Number,
        required: false,
    },
    useOnlyInThreadPost: {
        type: Boolean,
        required: false,
    },
});
export default mongoose.model<IText>("Text", textSchema);
