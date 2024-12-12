import mongoose, { Document, Schema } from "mongoose";

export interface IToken extends Document {
  address: string;
  name: string;
  symbol: string;
}

const tokenSchema: Schema = new Schema(
  {
    address: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    symbol: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IToken>("Token", tokenSchema);
