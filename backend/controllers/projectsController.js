import Project from "../models/Projects.js";
import User from "../models/User.js";
import { v4 as uuidv4 } from 'uuid';
import Task from "../models/TaskData.js";
import Notification from "../models/Notification.js";

export const createProject = async (req, res) => {
  try {
    const {
      ProjectCode,
      ProjectName,
      SOWFile,
      SampleFiles,
      PMId,
      BDEId,
      DepartmentId: Department,
      Frequency,
    } = req.body;

    // you can get userId from auth middleware
    const createdBy = req.user?._id || null;

    const project = new Project({
      ProjectCode,
      ProjectName,
      SOWFile,
      SampleFiles,
      PMId,
      BDEId,
      Department,
      Frequency,
      CreatedBy: createdBy,
    });

    await project.save();
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      status,
      search,
      // department,
      date_range,
      // qaStatus,
      qaid,
    } = req.query;

    const filter = {};
    // if (qaStatus) filter.QAStatus = qaStatus;
    // Status filter
    if (status && status !== "All") filter.Status = { $regex: `^${status}$`, $options: "i" };

    // Search filter
    if (search) filter.ProjectName = { $regex: search, $options: "i" };

    // QA filter
    if (qaid) filter.QAId = qaid;

    // Date range filter
    if (date_range) {
      const now = new Date();
      let startDate, endDate;

      switch (date_range.toLowerCase()) {
        case "today":
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "yesterday":
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setDate(endDate.getDate() - 1);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "this_week":
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - startDate.getDay());
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setHours(23, 59, 59, 999);
          break;
        case "last_week":
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - startDate.getDay() - 7);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setDate(endDate.getDate() - endDate.getDay());
          endDate.setHours(0, 0, 0, 0);
          break;
        case "this_month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date();
          endDate.setHours(23, 59, 59, 999);
          break;
        case "last_month":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate.setHours(0, 0, 0, 0);
          break;
        default:
          startDate = null;
          endDate = null;
          break;
      }

      if (startDate && endDate) {
        filter.CreatedDate = { $gte: startDate, $lt: endDate };
      }
    }

    // Role-based filtering
    // const userId = req.user._id;
    // const role = req.user.roleId?.name; // e.g., "superadmin", "PM", "TL", etc.

    // if (role !== "Superadmin") {
    //   filter.$or = [
    //     { PMId: userId },
    //     { TLId: userId },
    //     { DeveloperIds: userId },
    //     { QAId: userId },
    //     { BAUPersonId: userId },
    //   ];
    // }

    // Pagination
    const parsedPage = parseInt(page, 10) || 1;
    const parsedPageSize = parseInt(pageSize, 10) || 20;

    // Query database
    const total = await Project.countDocuments(filter);
    const projects = await Project.find(filter)
      .populate("PMId TLId DeveloperIds QAId BAUPersonId")
      .populate("CreatedBy", "name")

      .sort({ CreatedDate: -1 })
      .skip((parsedPage - 1) * parsedPageSize)
      .limit(parsedPageSize);

    // Send response
    res.status(200).json({
      data: projects,
      total,
      page: parsedPage,
      pageSize: parsedPageSize,
    });
    // console.log("Role:", role, "Filter:", filter); Debugging
  } catch (error) {
    console.error("Error in getProjects:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("PMId TLId DeveloperIds QAId BAUPersonId")
      .populate("qaReports.uploadedBy", "name")
      ; // optional: populate user info

    if (!project) return res.status(404).json({ message: "Project not found" });

    res.status(200).json({ project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProjectTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { TLId, DeveloperIds } = req.body;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // update TL + Developers
    if (TLId) project.TLId = TLId;
    if (DeveloperIds) project.DeveloperIds = DeveloperIds;

    await project.save();
    res.json({ message: "Project team updated", project });
  } catch (err) {
    console.error("Error updating project team:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAssignedToQAProjects = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, search = "", date_range, status } = req.query;

    // Filter for projects assigned to QA
    const filter = {
      Status: { $in: ["assigned_to_qa", "qa_open", "qa_failed", "qa_passed"] }, // matches your project Status field
      qaStatus: { $in: ["assigned_to_qa", "qa_open", "qa_failed", "qa_passed"] },
      // include all relevant QA statuses
    };


    if (status && status !== "All") {
      filter.Status = { $regex: `^${status}$`, $options: "i" };
    }


    // Search by ProjectName
    if (search) filter.ProjectName = { $regex: search, $options: "i" };

    // Optional date filter (StartDate or createdAt)
    if (date_range) {
      const now = new Date();
      let fromDate;

      if (date_range === "last_7_days") {
        fromDate = new Date();
        fromDate.setDate(now.getDate() - 7);
      }

      if (fromDate) filter.StartDate = { $gte: fromDate }; // adjust to your date field
    }

    //  Role based 
    const userId = req.user._id;
    const role = req.user.roleId?.name; // e.g., "superadmin", "PM", "TL", etc.

    // if (role !== "Superadmin") {
    //   filter.$or = [
    //     { PMId: userId },
    //     { TLId: userId },
    //     { DeveloperIds: userId },
    //     { QAId: userId },
    //     { BAUPersonId: userId },
    //   ];
    // }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const total = await Project.countDocuments(filter);
    const projects = await Project.find(filter)
      .populate("PMId TLId DeveloperIds QAId BAUPersonId")
      .sort({ StartDate: -1 }) // sort by StartDate or createdAt
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pageSize: limit,
      data: projects,
    });

    // console.log("Assigned-to-QA projects:", projects);
  } catch (error) {
    console.error("Error fetching assigned-to-QA projects:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const transitionProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { to, comment = "", role, fileName, fileLink } = req.body;
    const userId = req.user.id;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    let fromStatus;

    if (role === "Developer") {
      fromStatus = project.developerStatus;
      project.developerStatus = to;

      // Push assigned file if present
      if (fileName && fileLink) {
        project.assignedFiles.push({
          fileName,
          fileLink,
          assignedBy: userId,
          assignedAt: new Date(),
        });
      }

    } else if (role === "QA") {
      fromStatus = project.qaStatus;
      project.qaStatus = to;

      // Push QA report if present
      if (fileName && fileLink) {
        project.qaReports.push({
          comment,
          fileName,
          fileLink,
          uploadedBy: userId,
          uploadedAt: new Date(),
        });
      }

      // Optional QA cycle
      if (to === "in_qa") project.qaCycleTimes.push({ start: new Date() });
      if (to === "qa_passed") {
        const lastCycle = project.qaCycleTimes[project.qaCycleTimes.length - 1];
        if (lastCycle && !lastCycle.end) lastCycle.end = new Date();
      }
      if (to === "qa_rejected") project.reworkCount = (project.reworkCount || 0) + 1;
    }

    // Update global Status
    project.Status = to;
    project.qaStatus = to;

    // History log
    project.history.push({
      userId,
      fromStatus,
      toStatus: to,
      comment,
      date: new Date(),
    });
    // console.log(project);
    await project.save();
    res.status(200).json({ message: "Project status updated", project });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const QAReport = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const { comment, status, qaStatus } = req.body; // ✅ extract qaStatus
    const fileLink = req.file ? `/uploads/${req.file.filename}` : null;
    const userId = req.user.id;

    const fromStatus = project.qaStatus;

    // ✅ Maintain both fields
    project.qaStatus = qaStatus; // QA-specific status (qa_failed, qa_passed, etc.)
    project.Status = status;     // General project status

    // Generate persistent QA link only if not exists
    if (!project.qaReportLink) {
      project.qaReportLink = `/qa/${uuidv4()}`;
    }

    // Save QA report entry
    project.qaReports.push({
      comment,
      fileName: req.file?.originalname,
      fileLink,
      uploadedBy: userId,
      uploadedAt: new Date(),
      status,
      qaStatus,
    });

    // ✅ QA cycle logic
    if (qaStatus === "in_qa") {
      project.qaCycleTimes.push({ start: new Date() });
    }
    if (qaStatus === "qa_passed") {
      const lastCycle = project.qaCycleTimes[project.qaCycleTimes.length - 1];
      if (lastCycle && !lastCycle.end) lastCycle.end = new Date();
    }
    if (qaStatus === "qa_failed") {
      project.reworkCount = (project.reworkCount || 0) + 1; // ✅ increment correctly
    }

    // History log
    project.history.push({
      userId,
      fromStatus,
      toStatus: qaStatus, // ✅ better to track QA-specific transition
      comment,
      date: new Date(),
    });

    await project.save();
    res.json({
      message: "QA report submitted",
      qaReportLink: project.qaReportLink,
      reworkCount: project.reworkCount,
      qaStatus: project.qaStatus,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



export const AssignToQa = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const { fileLink } = req.body;
    const fileName = req.file?.originalname || req.body.fileName;
    const userId = req.user.id;

    const fromStatus = project.developerStatus;
    project.developerStatus = "assigned_to_qa";
    project.Status = "assigned_to_qa"; // global status
    project.qaStatus = "assigned_to_qa";

    project.assignedFiles.push({
      fileName,
      fileLink: fileLink || (req.file ? `/uploads/${req.file.filename}` : null),
      assignedBy: userId,
      assignedAt: new Date(),
    });

    // History log
    project.history.push({
      userId,
      fromStatus,
      toStatus: "assigned_to_qa",
      comment: "File assigned to QA",
      date: new Date(),
    });

    await project.save();
    res.json({ message: "File assigned to QA" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// project transition
// export const transitionProject = async (req, res) => {
//   try {
//     const projectId = req.params.id;
//     const { to, comment, revert_subtasks = [] } = req.body;
//     const userId = req.user.id;

//     if (!comment) return res.status(400).json({ message: "Comment is required" });

//     const project = await Project.findById(projectId);
//     if (!project) return res.status(404).json({ message: "Project not found" });

//     const from = project.Status;

//     // Validate allowed transitions
//     const allowedTransitions = {
//       "New": ["in_development"],
//       "in_development": ["in_qa"],
//       "in_qa": ["qa_passed", "qa_rejected", "in_development"],
//       "qa_passed": ["completed"],
//       "qa_rejected": ["in_development"],
//       "completed": []
//     };

//     if (!allowedTransitions[from] || !allowedTransitions[from].includes(to)) {
//       return res.status(400).json({ message: `Invalid transition from ${from} to ${to}` });
//     }

//     // Handle specific transitions
//     if (from === "in_development" && to === "in_qa") {
//       // Entering QA, start cycle time
//       project.qaCycleTimes.push({ start: new Date() });
//       await sendNotification(project.QAId, project._id, `Project ${project.ProjectName} is ready for QA`);
//     }

//     if (from === "in_qa" && to === "qa_passed") {
//       // End last QA cycle
//       const lastCycle = project.qaCycleTimes[project.qaCycleTimes.length - 1];
//       if (lastCycle && !lastCycle.end) {
//         lastCycle.end = new Date();
//       }
//     }

//     if (from === "in_qa" && to === "qa_rejected") {
//       // Increment rework count
//       project.reworkCount = (project.reworkCount || 0) + 1;
//     }

//     if (from === "in_qa" && to === "in_development") {
//       // Revert, reopen tasks
//       for (const taskId of revert_subtasks) {
//         await Task.findByIdAndUpdate(taskId, { Status: "in_progress" });
//       }
//       project.reworkCount = (project.reworkCount || 0) + 1;
//     }

//     // Update status
//     project.Status = to;

//     // Add activity log
//     project.history.push({
//       userId,
//       fromStatus: from,
//       toStatus: to,
//       comment,
//       timestamp: new Date()
//     });

//     await project.save();
//     res.status(200).json({ message: "Project transitioned", project });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // Project history
export const getProjectHistory = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("history.userId", "name");
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.status(200).json({ history: project.history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// // Utility for sending notifications
// const sendNotification = async (userId, projectId, message) => {
//   if (!userId) return;
//   const notif = new Notification({ userId, projectId, message });
//   await notif.save();
// };

// CREATE new project

// export const createProject = async (req, res) => {
//   try {
//     const {
//       ProjectCode,
//       ProjectName,
//       SOWFile,
//       SampleFiles,
//       // InputFile,
//       // OutputFile,
//       Frequency,
//       Platform,
//       RulesStatus,
//       PMId,
//       TLId,
//       DeveloperIds,
//       QAId,
//       BAUPersonId,
//       StartDate,
//       EndDate
//     } = req.body;

//     // const pmUser = PMId ? await User.findOne({ name: PMId }) : null;
//     const tlUser = TLId ? await User.findOne({ name: TLId }) : null;
//     // const qaUser = QAId ? await User.findOne({ name: QAId }) : null;
//     const bauUser = BAUPersonId ? await User.findOne({ name: BAUPersonId }) : null;

//     const developerUsers = DeveloperIds && DeveloperIds.length > 0
//       ? await User.find({ name: { $in: DeveloperIds } })
//       : [];

//     const newProject = new Project({
//       ProjectCode,
//       ProjectName,
//       SOWFile,
//       SampleFiles,
//       PMId,
//       InputFile,
//       OutputFile,
//       Frequency,
//       Platform,
//       RulesStatus,
//       TLId: tlUser?._id || null,
//       DeveloperIds: developerUsers.map(u => u._id),
//       QAId,
//       BAUPersonId: bauUser?._id || null,
//       StartDate: StartDate ? new Date(StartDate) : null,
//       EndDate: EndDate ? new Date(EndDate) : null,
//     });

//     const saved = await newProject.save();
//     res.status(201).json({ message: "Project created", project: saved });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };
