// models/FeedData.js
import mongoose from "mongoose";

const feedSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    FeedName: { type: String, required: true },
    FeedId: { type: String, required: true },
    Status: { type: String, default: "New" },
    Platform: { type: String, },
    BAU: { type: String, default: "None" },
    POC: { type: String, default: "None" },
    PCId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    TLId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    DeveloperIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    QAId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    BAUPersonId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    DomainName: { type: String},
    FrameworkType: { type: String, default: "N/A" },
    CountryName: { type: String},
    ApplicationType: { type: String},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    createdDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Feed", feedSchema, "Feed-data");
