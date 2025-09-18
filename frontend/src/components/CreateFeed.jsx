import React, { useState, useEffect } from "react";

function CreateFeed({ onClose, onSuccess }) {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [feedId, setFeedId] = useState("");
  const [feedName, setFeedName] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch projects for dropdown
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects`,
          { credentials: "include" }
        );
        const result = await response.json();
        if (response.ok) {
          setProjects(result.data || []);
        } else {
          console.error("Failed to fetch projects:", result.message);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };

    fetchProjects();
  }, []);

  // Save feed
  const handleSave = async () => {
    if (!projectId || !feedId || !feedName) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/feed/${projectId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            FeedName: feedName,
            FeedId: feedId,
          }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        onSuccess?.(result.feed); // callback for parent to refresh list
        onClose();
      } else {
        alert(result.message || "Failed to create feed");
      }
    } catch (err) {
      console.error("Error creating feed:", err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl shadow-xl relative">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Add New Feed</h2>

        {/* Feed Details */}
        <div className="mb-6">
          <h3 className="mb-4 bg-purple-200 text-purple-700 px-3 py-2 rounded-md text-md font-semibold">
            Feed Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Project
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-gray-100 rounded p-2"
              >
                <option value="" disabled>
                  Select Project
                </option>
                {projects.map((proj) => (
                  <option key={proj._id} value={proj._id}>
                    {proj.ProjectName}
                  </option>
                ))}
              </select>
            </div>

            {/* Feed ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feed ID
              </label>
              <input
                type="text"
                value={feedId}
                onChange={(e) => setFeedId(e.target.value)}
                placeholder="Enter Feed ID"
                className="w-full bg-gray-100 rounded p-2"
                required
              />
            </div>

            {/* Feed Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feed Name
              </label>
              <input
                type="text"
                value={feedName}
                onChange={(e) => setFeedName(e.target.value)}
                placeholder="Feed Name"
                className="w-full bg-gray-100 rounded p-2"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateFeed;
