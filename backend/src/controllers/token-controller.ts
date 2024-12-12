import { NextFunction, Request, Response } from "express";
import Token from "../models/token-model";

export const createToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { address, name, symbol } = req.body;

    const existingToken = await Token.findOne({ address });
    if (existingToken) {
      res.status(400).json({ message: "Token already exists" });
      return;
    }

    const newToken = new Token({ address, name, symbol });
    await newToken.save();

    res.status(201).json(newToken);
  } catch (error) {
    next(error);
  }
};

export const getAllTokens = async (req: Request, res: Response) => {
  try {
    const tokens = await Token.find();
    res.status(200).json(tokens);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
