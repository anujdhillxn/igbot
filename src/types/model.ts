import mongoose from "mongoose";

export interface IImageMeta {
    name: string;
    posted: boolean;
}

export interface IImage extends mongoose.Document {
    name: string;
    blob: Buffer;
}

export interface IImageModel extends mongoose.Model<IImage> {}

export interface IAccount extends mongoose.Document {
    username: string;
    password: string;
    active: boolean;
    images: IImageMeta[];
    videos: string[];
    hashtags: string;
}

export interface IAccountModel extends mongoose.Model<IAccount> {}

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

export interface ITextModel extends mongoose.Model<IText> {}
