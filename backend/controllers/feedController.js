import FeedData from "../models/FeedData.js";
import mongoose from "mongoose";
import Project from "../models/Projects.js"
import Feed from "../models/FeedData.js";

// GET /api/table?status=Active&page=2&limit=5&sort=createdAt:desc&search=abc

export const createFeed = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { FeedName } = req.body;
    const { FeedId } = req.body;
    const userId = req.user.id;

    // Ensure project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const feed = new Feed({
      projectId,
      FeedName,
      FeedId,
      createdBy: userId,
    });

    await feed.save();

    res.status(201).json({ message: "Feed created successfully", feed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getFeeds = async (req, res) => {
  try {
    // Query params for pagination + search
    const page = parseInt(req.query.page) || 1;          // current page (default 1)
    const limit = parseInt(req.query.limit) || 10;       // docs per page (default 10)
    const search = req.query.search || "";               // search query
 
    const skip = (page - 1) * limit;

    // Build filter for searching (case-insensitive, regex-based)
    const filter = search
      ? { feedName: { $regex: search, $options: "i" } }
      : {};

 
    const [data, total] = await Promise.all([
      FeedData.find(filter).populate("projectId").populate({
        path: "projectId",
        populate: [
          { path: "PMId", name :"name" },        // populate PM
          { path: "TLId", name: "name" },        // populate TL
          { path: "DeveloperIds", name: "name" } // populate multiple developers
        ]
      })
      .populate("createdBy", "name").skip(skip).limit(limit).lean(), // lean() = faster, returns plain JS objects
      FeedData.countDocuments(filter)
    ]);

    res.status(200).json({
      total,
      data,
    });
  } catch (err) {
    console.error("Error fetching feeds:", err);
    res.status(500).json({ error: "Failed to fetch feeds" });
  }
};


// GET single feed
export const getFeedById = async (req, res) => {
  try {
    const feed = await FeedData.findById(req.params.id);
    if (!feed) return res.status(404).json({ message: "Feed not found" });
    res.status(200).json(feed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch feed" });
  }
};

// Update feed details
export const updateFeedById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid feed ID" });
    }

    console.log("Update ID:", id);
    console.log("Update body:", req.body);

    const updatedFeed = await FeedData.findOneAndUpdate(
      { _id: id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedFeed) {
      return res.status(404).json({ message: "Feed not found" });
    }

    res.status(200).json(updatedFeed);
  } catch (err) {
    console.error("Error updating feed:", err);
    res.status(500).json({ error: "Failed to update feed" });
  }
};





// GET feed logs with pagination
// export const getFeedLogs = async (req, res) => {
//   try {
//     const { page = 1, limit = 25, search, sort } = req.query;
//     const pageNumber = parseInt(page, 10);
//     const pageSize = parseInt(limit, 10);
//     const skip = (pageNumber - 1) * pageSize;

//     const query = { feedId: req.params.id };
//     if (search) {
//       query.$or = [
//         { message: { $regex: search, $options: "i" } },
//         { status: { $regex: search, $options: "i" } },
//       ];
//     }

//     const total = await FeedLog.countDocuments(query);
//     const logs = await FeedLog.find(query)
//       .sort(sort ? JSON.parse(sort) : { createdAt: -1 })
//       .skip(skip)
//       .limit(pageSize);

//     res.status(200).json({
//       data: logs,
//       totalItems: total,
//       page: pageNumber,
//       totalPages: Math.ceil(total / pageSize),
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch logs" });
//   }
// };
