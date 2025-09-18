import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Breadcrumb from "../components/Breadcrumb";

function FeedUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Feed Details");

  // Fetch feed details by id
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await fetch(`http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/feed/${id}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        setFeed(data);
        console.log("Fetched feed:", data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching feed:", err);
        setLoading(false);
      }
    };
    fetchFeed();
  }, [id]);

 const handleChange = (e) => {
  const { name, value } = e.target;
  setFeed({ ...feed, [name]: value });
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/feed/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feed),
      });
      if (res.ok) {
        alert("Feed updated successfully!");
        navigate(`/feed/${id}`);
      } else {
        alert("Failed to update feed");
      }
    } catch (err) {
      console.error("Error updating feed:", err);
    }
  };

  const tabs = [
    "Feed Details",
    "Frequency",
    "Databases",
    "Systems",
    "Database Tables",
    "Auto QA Rules"
  ]

// Loading state
  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <>
    <div className="flex bg-gray-50 items-center justify-between px-4">
          <Breadcrumb />
          {/* <button
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded cursor-pointer"
            onClick={() => navigate(`/feed/update/${id}`)}
          >
            <FaEdit size={18} />
            <span>Edit</span>
          </button> */}
        </div>
        <div className="border-b border-gray-200 mb-4 overflow-x-auto whitespace-nowrap">
              {tabs.map((tabs) => (
                <button
                  key={tabs}
                  onClick={() => 
                    setActiveTab(tabs)

                  }
                  className={`inline-block px-4 py-2 text-xs font-medium transition-colors duration-200 ${
                    activeTab === tabs
                      ? "border-b-2 border-purple-800 text-purple-800"
                      : "text-gray-500"
                  }`}
                >
                  {tabs}
                </button>
              ))}
            </div>
    <div className="p-6 mx-auto">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-6 bg-white rounded-xl p-6"
      >
        {/* Project */}
        <div>
          <label className="block font-medium mb-1">Project *</label>
          <input
  type="text"
  name="ProjectName"
  value={feed["ProjectName"] || ""}
  onChange={handleChange}
  className="w-full bg-gray-200 rounded-md px-3 py-2 focus:outline-none"
/>

        </div>

        {/* Feed Title */}
        <div>
          <label className="block font-medium mb-1">Feed Name *</label>
         <input
  type="text"
  name={Object.keys(feed).find(k => k.replace(/\s/g, "").toLowerCase() === "feedname")}
  value={feed[Object.keys(feed).find(k => k.replace(/\s/g, "").toLowerCase() === "feedname")] || ""}
  onChange={handleChange}
  className="w-full bg-gray-200 rounded-md px-3 py-2 focus:outline-none"
/>

        </div>

        {/* Platform */}
        <div>
          <label className="block font-medium mb-1">Platform *</label>
          <input
            type="text"
            name="Platform"
            value={feed.Platform || ""}
            onChange={handleChange}
            className="w-full bg-gray-200 rounded-md px-3 py-2 focus:outline-none"
          />
        </div>

        {/* Developers */}
        <div>
          <label className="block font-medium mb-1">Developers *</label>
          <input
            type="text"
            name="Developers"
            value={feed.Developer || ""}
            onChange={handleChange}
            className="w-full bg-gray-200 rounded-md px-3 py-2 focus:outline-none"
          />
        </div>

        {/* QA */}
        <div>
          <label className="block font-medium mb-1">QA *</label>
          <input
            type="text"
            name="QA"
            value={feed.QA || ""}
            onChange={handleChange}
            className="w-full bg-gray-200 rounded-md px-3 py-2 focus:outline-none"
          />
        </div>
        
        <div>
          <label className="block font-medium mb-1">Manage</label>
          <input
            type="text"
            name="Manage By"
            value={feed['Manage By'] || ""}
            onChange={handleChange}
            className="w-full bg-gray-200 rounded-md px-3 py-2 focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Feed BAU</label>
          <input
            type="text"
            name="BAU"
            value={feed.BAU || ""}
            onChange={handleChange}
            className="w-full bg-gray-200 rounded-md px-3 py-2 focus:outline-none"
          />
        </div>

        {/* Approx No of Input Listings */}
        {/* <div>
          <label className="block text-sm font-medium mb-1">
            Approx No of Input Listings *
          </label>
          <input
            type="number"
            name="inputListings"
            value={feed.inputListings || ""}
            onChange={handleChange}
            className="w-full bg-gray-200 rounded-md px-3 py-2 focus:outline-none"
          />
        </div> */}

        {/* Approx No of Output Listings */}
        {/* <div>
          <label className="block font-medium mb-1">
            Approx No of Output Listings *
          </label>
          <input
            type="number"
            name="outputListings"
            value={feed.outputListings || ""}
            onChange={handleChange}
            className="w-full bg-gray-200 rounded-md px-3 py-2 focus:outline-none"
          />
        </div> */}

        

        {/* Remark */}
        <div>
          <label className="block font-medium mb-1">Feed Status</label>
          <input
            type="text"
            name="Status"
            value={feed.Status || ""}
            onChange={handleChange}
            className="w-full bg-gray-200 rounded-md px-3 py-2 focus:outline-none"
          />
        </div>

        {/* Submit */}
        <div className="col-span-2 flex justify-end">
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
          >
            Update Feed
          </button>

        </div>
      </form>
    </div>
    </>
  );
}

export default FeedUpdate;
