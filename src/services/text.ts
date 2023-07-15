import { FilterQuery } from "mongoose";
import { TextModel } from "../models";
import { IText, TextType } from "../types/model";
import { randomIntegerBetween } from "./utils";

export const findText = async (
    filters: FilterQuery<IText>
): Promise<IText | null> => {
    return await TextModel.findOne(filters);
};

export const createText = async (data: IText): Promise<IText> => {
    const account = await new TextModel(data).save();
    return account;
};

export const editText = async (
    _id: string,
    newInfo: Partial<IText>
): Promise<IText | null> => {
    const account = await findText({ _id });
    if (account === null) {
        return null;
    }
    const newText = { ...account, ...newInfo } as IText;
    return await newText.save();
};

export const deleteText = async (_id: string) => {
    const text = await findText({ _id });
    if (text) {
        await text.remove();
    }
};

export const generateCaption = async (
    isThreadPost: boolean
): Promise<string> => {
    while (true) {
        const captions = await TextModel.find({ textType: TextType.CAPTION });
        const randomIndex = randomIntegerBetween(0, captions.length - 1);
        const captionObj = captions[randomIndex];
        if (!isThreadPost && captionObj.useOnlyInThreadPost) {
            continue;
        }
        return captions[randomIndex].content;
    }
};
