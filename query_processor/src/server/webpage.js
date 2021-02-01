import mongoose, { Schema } from "mongoose";

const webpageSchema = new Schema({
  url: String,
  title: String,
  summary: String,
  content: [String],
  size: Number,
  terms: [String],
});

export default mongoose.model("webpage", webpageSchema);
