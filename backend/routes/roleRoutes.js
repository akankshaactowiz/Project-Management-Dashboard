import express from "express";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Module from "../models/Module.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";
import { roleHierarchy } from "../config/roleHierarchy.js";
const router = express.Router();

// 1️⃣ Get all roles visible to current user
router.get("/", protect, async (req, res) => {
  try {
    const requestingUser = await User.findById(req.user._id).populate("roleId");
    if (!requestingUser) return res.status(404).json({ message: "User not found" });

    const requesterRole = requestingUser.roleId.name;
    const visibleRoles = roleHierarchy[requesterRole] || [];

    const roles = requesterRole === "Superadmin"
      ? await Role.find().lean()
      : await Role.find({ name: { $in: visibleRoles } }).lean();

    res.json({ roles });
  } catch (err) {
    console.error("Roles fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 2️⃣ Update a role's permissions (only if user can access the role)
// router.put("/:roleId", protect, authorize("Settings", "update"), async (req, res) => {
//   try {
//     const { permissions, description } = req.body;

//     const requestingUser = await User.findById(req.user._id).populate("roleId");
//     const requesterRole = requestingUser.roleId.name;
//     const visibleRoles = roleHierarchy[requesterRole] || [];

//     const role = await Role.findById(req.params.roleId);
//     if (!role) return res.status(404).json({ message: "Role not found" });

//     // Only allow editing if role is in hierarchy
//     if (requesterRole !== "Superadmin" && !visibleRoles.includes(role.name)) {
//       return res.status(403).json({ message: "Not authorized to edit this role" });
//     }

//     role.permissions = permissions;
//     if (description) role.description = description;

//     await role.save();
//     res.json({ role });
//   } catch (err) {
//     console.error("Update role error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

router.get("/modules", protect, async (req, res) => {
  try {
    // Fetch all modules from DB
    const modules = await Module.find({}, { module: 1, actions: 1, _id: 0 }).lean();

    res.json({ modules });
  } catch (err) {
    console.error("Modules fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Edit permissions of a role
router.put(
  "/:id",
  protect,
  authorize("Settings", "update"),
  async (req, res) => {
    try {
      const { permissions } = req.body; // expected array of {module, actions}
      const roleId = req.params.id;

      if (!Array.isArray(permissions)) {
        return res.status(400).json({ message: "Permissions must be an array" });
      }

      // Update role
      const updatedRole = await Role.findByIdAndUpdate(
        roleId,
        { $set: { permissions } }, // overwrite permissions with new array
        { new: true } // return updated doc
      );

      if (!updatedRole) {
        return res.status(404).json({ message: "Role not found" });
      }

      res.json({ message: "Permissions updated", role: updatedRole });
    } catch (err) {
      console.error("Role update error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
