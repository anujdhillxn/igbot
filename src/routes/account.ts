import express, { Request, Response, Router } from "express";
import { IAccount } from "../types/model";
import {
    createAccount,
    deleteAccount,
    editAccount,
    findAccount,
} from "../services/account";
import { AccountModel } from "../models";

const router: Router = express.Router();

// Getting all

router.get("/", async (req: Request, res: Response) => {
    try {
        const accounts: IAccount[] = await AccountModel.find();
        res.json(accounts);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Getting One
router.get("/:username", async (req: Request, res: Response) => {
    const account = await findAccount({
        username: req.params.username,
    });
    if (account === null) {
        res.status(404).json({ message: "Account not found" });
    }
    res.json(account);
});

// Creating one

router.post("/", async (req: Request, res: Response) => {
    try {
        const newAccount: IAccount = await createAccount(
            req.body.username,
            req.body.password
        );
        res.status(201).json(newAccount);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

router.patch("/:username", async (req: Request, res: Response) => {
    try {
        const updatedAccount = editAccount(
            req.params.username,
            req.body.newInfo
        );
        if (updatedAccount === null) {
            res.status(404).json({ message: "Account not found." });
        }
        res.json(updatedAccount);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Deleting One
router.delete("/:username", async (req: Request, res: Response) => {
    try {
        await deleteAccount(req.params.username);
        res.json({ message: "Deleted Account" });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
