import mongoose from "mongoose";

export interface IAccount extends mongoose.Document {
    username: string;
    password: string;
    active: boolean;
    postedImages: string[];
    postedVideos: string[];
    hashtags: string;
}

export enum TextType {
    CAPTION = "CAPTION",
    COMMENT = "COMMENT",
    BOTH = "BOTH",
}

export enum Language {
    ENGLISH = "ENGLISH",
    HINDI = "HINDI",
    UNKNOWN = "UNKNOWN",
}

export interface IText extends mongoose.Document {
    content: string;
    textType: TextType;
    language: Language;
    preferableMonth?: string;
    preferableDay?: string;
    preferableTimeStart?: number;
    preferableTimeEnd?: number;
    useOnlyInThreadPost?: boolean;
}
