// models/FeedData.js
import mongoose from "mongoose";

const feedSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    FeedName: { type: String, required: true },
    FeedId: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Feed", feedSchema, "Feed-data");
