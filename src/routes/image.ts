import express, { Request, Response, Router } from "express";
import { getImage } from "../services/image";
const router: Router = express.Router();

// Getting One
router.get("/:name", async (req: Request, res: Response) => {
    const imageBuffer = await getImage(req.params.name);
    if (!imageBuffer) {
        res.status(404).json({ message: "Image not found" });
    }
    res.send(imageBuffer);
});

export default router;
