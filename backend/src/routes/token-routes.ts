import express from "express";
import { createToken, getAllTokens } from "../controllers/token-controller";

const router = express.Router();

router.post("/tokens", createToken);
router.get("/tokens", getAllTokens);

export default router;
