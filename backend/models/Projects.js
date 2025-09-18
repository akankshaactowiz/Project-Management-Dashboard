// import mongoose from "mongoose";

// // models/Project.js

// const projectSchema = new mongoose.Schema(
//   {
//     ProjectCode: { type: String, required: true, unique: true },
//     Frequency: { type: String, enum: ["Daily", "Weekly", "Monthly"], default: "Daily" },
//     Platform: { type: String, required: true },
//     Status: { type: String, default: "New" },
//     BAU: { type: String , default: "None" },
//     POC: { type: String, default: "None" },


//     // --- ObjectId references ---
//     PMId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     PCId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     TLId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     DeveloperIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     QAId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     BAUPersonId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

//     // Dates
//     StartDate: { type: Date },   // <-- Added
//     EndDate: { type: Date },     // <-- Added
//     FrameworkType: { type: String, default: "N/A" },
//     QAReportCount: { type: Number, default: 0 },
//     ManageBy: { type: String, default: "N/A" },
//     QARules: { type: Number, default: 0 },
//     RulesStatus: { type: String, default: "Draft" },
//     RulesApply: { type: String, default: "Database" },
//     // FeedId: { type: Number, required: true },
//     // FeedName: { type: String, required: true },
//     ProjectName: { type: String, required: true },
//     CreatedDate: { type: Date, default: Date.now },
//     DBStatus: { type: String, default: "Actowizdb" },
//     DBType: { type: String, default: "MongoDB" },
//   },
//   { timestamps: true }
// );


// export default mongoose.model("Project", projectSchema, "Project_data");


import mongoose from "mongoose";
import User from "./User.js";


const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fromStatus: { type: String, },
  toStatus: { type: String,},
  date: { type: Date, default: Date.now },
  comment: { type: String, },
  timestamp: { type: Date, default: Date.now }
});
const assignedFileSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileLink: { type: String, required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignedAt: { type: Date, default: Date.now },
});
const projectSchema = new mongoose.Schema({
  ProjectCode: { type: String, required: true, unique: true },
  Frequency: { type: String, default: "Daily" },
  Platform: { type: String, required: true },

  // --- SALES ---
  SOWFile: { type: String, required: true },
  InputFile: { type: String, required: true },
  OutputFile: { type: String, required: true },

  
  Status: { type: String, default: "New" },
  BAU: { type: String , default: "None" },
  POC: { type: String, default: "None" },
  PMId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  PCId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  TLId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  DeveloperIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  QAId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  BAUPersonId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  StartDate: { type: Date },
  EndDate: { type: Date },
  FrameworkType: { type: String, default: "N/A" },
  QAReportCount: { type: Number, default: 0 },
  ManageBy: { type: String, default: "N/A" },
  QARules: { type: Number, default: 0 },
  RulesStatus: { type: String, default: "Draft" },
  RulesApply: { type: String, default: "Database" },
  ProjectName: { type: String, required: true },
  CreatedDate: { type: Date, default: Date.now },
  DBStatus: { type: String, default: "Actowizdb" },
  DBType: { type: String, default: "MongoDB" },

  Feeds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Feed", required: true }],

  // New fields for tracking QA cycles, history, etc.
  history: [activityLogSchema],
  qaCycleTimes: [{ start: Date, end: Date }],
  reworkCount: { type: Number, default: 0 },
  assignedFiles: [assignedFileSchema],
  qaReports: [
  {
    comment: String,
    status: { type: String,},
    fileName: String,
    fileLink: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    uploadedAt: Date,
    // uniqueId: String,
    developerComments: [
      {
        comment: String,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        date: { type: Date, default: Date.now }
      }
    ]
  }
],
qaReportLink: { type: String, unique: true },
  //  qaReports: [qaReportSchema],
  devSubmissions: [
    {
      fileName: String,
      fileUrl: String,
      submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      submittedAt: { type: Date, default: Date.now }
    }
  ],
  developerStatus: { type: String, default: "New" },
  qaStatus: { type: String, default: "" },
}, { timestamps: true });



export default mongoose.model("Project", projectSchema, "Project_data");
