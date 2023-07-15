import { FilterQuery } from "mongoose";
import { AccountModel } from "../models";
import { IAccount } from "../types/model";

export const findAccount = async (
    filters: FilterQuery<IAccount>
): Promise<IAccount | null> => {
    return await AccountModel.findOne(filters);
};

export const createAccount = async (
    username: string,
    password: string
): Promise<IAccount> => {
    const account = await new AccountModel({ username, password }).save();
    return account;
};

export const editAccount = async (
    username: string,
    newInfo: Partial<IAccount>
): Promise<IAccount | null> => {
    const account = await findAccount({ username });
    if (account === null) {
        return null;
    }
    if (newInfo.username !== undefined) {
        account.username = newInfo.username;
    }
    if (newInfo.password !== undefined) {
        account.password = newInfo.password;
    }
    if (newInfo.active !== undefined) {
        account.active = newInfo.active;
    }
    if (newInfo.postedImages !== undefined) {
        account.postedImages = newInfo.postedImages;
    }
    if (newInfo.postedVideos !== undefined) {
        account.postedVideos = newInfo.postedVideos;
    }
    if (newInfo.hashtags !== undefined) {
        account.hashtags = newInfo.hashtags;
    }
    return await account.save();
};

export const deleteAccount = async (username: string) => {
    const account: IAccount | null = await findAccount({ username });
    if (account) {
        await account.remove();
    }
};
