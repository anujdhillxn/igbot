import express, { Request, Response, Router } from "express";
import { IText } from "../types/model";
import { createText, deleteText, editText, findText } from "../services/text";
import { TextModel } from "../models";

const router: Router = express.Router();

// Getting all

router.get("/", async (req: Request, res: Response) => {
    try {
        const texts = await TextModel.find();
        res.json(texts);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/", async (req: Request, res: Response) => {
    try {
        const data = req.body as IText;
        const newText = await createText(data);
        res.status(201).json(newText);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

router.patch("/:username", async (req: Request, res: Response) => {
    try {
        const updatedText = editText(req.params._id, req.body.newInfo);
        if (updatedText === null) {
            res.status(404).json({ message: "Text not found." });
        }
        res.json(updatedText);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Deleting One
router.delete("/:username", async (req: Request, res: Response) => {
    try {
        await deleteText(req.params._id);
        res.json({ message: "Deleted Text" });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
