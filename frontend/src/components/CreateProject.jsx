import { useState, useEffect } from "react";
import Select from "react-select";

export default function CreateProjectModal({ isOpen, onClose }) {

  const [pmOptions, setPmOptions] = useState([]);
  const [qaOptions, setQaOptions] = useState([]);

  // don't render if closed

  const options = [
    { value: "vivek Pankhaniya", label: "Vivek Pankhaniya" },
    { value: "Aakanksha Chahal", label: "Aakanksha Chahal" },
  ];



  // --- State for form fields ---
  const [form, setForm] = useState({
    ProjectCode: "",
    ProjectName: "",
    Frequency: "",
    Priority: "",
    Platform: "",
    RulesStatus: "",
    PM: "",
    TL: "",
    Developers: [],
    BAUPerson: "",
    QA: "",
    StartDate: "",
    EndDate: "",
  });



  // --- Handle input changes ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDevelopersChange = (selectedOptions) => {
    setForm((prev) => ({
      ...prev,
      Developers: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
    }));
  };


  // PM and QA list
useEffect(() => {
  const loadManagers = async () => {
    try {
      const res = await fetch(
        `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users/pm-qa`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to fetch managers");

      const data = await res.json();
      setPmOptions(data.pmUsers);
      setQaOptions(data.qaUsers);
    } catch (err) {
      console.error(err);
      setPmOptions([]);
      setQaOptions([]);
    }
  };

  loadManagers();
}, []);

  // --- Save project function ---
  const handleSave = async () => {
    try {
      const payload = {
        ProjectCode: form.ProjectCode,
        ProjectName: form.ProjectName,
        Frequency: form.Frequency,
        Platform: form.Platform,
        RulesStatus: form.RulesStatus,
        PMId: form.PM,           // Replace with ObjectId if needed
        // TLId: form.TL,           // Replace with ObjectId if needed
        // DeveloperIds: form.Developers, // Replace with ObjectIds
        QAId: form.QA,
        // BAUPersonId: form.BAUPerson,
        StartDate: form.StartDate,
        EndDate: form.EndDate,
        // FeedId: 101,             
     };


      const res = await fetch(`http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        alert("Project created successfully");
        onClose();
      } else {
        alert(data.message || "Failed to create project");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  if (!isOpen) return null; 
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl shadow-xl relative">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Add New Project</h2>

        {/* Project Details Section */}
        <div className="mb-6">
          <h3 className="mb-4 bg-purple-200 text-purple-700 px-3 py-2 rounded-md text-md font-semibold">
            Project Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Code</label>
              <input
                type="text"
                name="ProjectCode"
                value={form.ProjectCode}
                onChange={handleChange}
                placeholder="Code Should Start with 'ACT'"
                className="w-full bg-gray-100 rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                type="text"
                name="ProjectName"
                value={form.ProjectName}
                onChange={handleChange}
                placeholder="Project Name"
                className="w-full bg-gray-100 rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                name="Frequency"
                value={form.Frequency}
                onChange={handleChange}
                className="w-full bg-gray-100 rounded p-2"
              >
                <option value="">Select Frequency</option>
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
                <option value="Daily">Daily</option>
                <option value="one-time">One-time</option>
                <option value="ad-hoc">Ad-hoc / On-demand</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
              <input
                type="text"
                name="Platform"
                value={form.Platform}
                onChange={handleChange}
                placeholder="Project platform"
                className="w-full bg-gray-100 rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rules Status</label>
              <select
                name="RulesStatus"
                value={form.RulesStatus}
                onChange={handleChange}
                className="w-full bg-gray-100 rounded p-2"
              >
                <option value="">Select status</option>
                <option value="Publish">Publish</option>
                <option value="Unpublish">Unpublish</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="mb-6">
          <h3 className="mb-4 bg-purple-200 text-purple-700 px-3 py-2 rounded-md text-md font-semibold">
            Additional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager</label>
              <select
                name="PM"
                value={form.PM}
                onChange={handleChange}
                className="w-full bg-gray-100 rounded p-2"
              >
                <option value="">Select PM</option>
                <option value="Ashish">Ashish</option>
                <option value="Abhishek">Abhishek</option>
                <option value="Rohit">Rohit</option>
              </select>
            </div> */}
            
            {/* Project Manager */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager</label>
              <select
                name="PM"
                value={form.PM}
                onChange={handleChange}
                className="w-full bg-gray-100 rounded p-2"
              >
                <option value="">Select PM</option>
                {pmOptions.map((user) => (
                  <option key={user._id} value={user._id}>{user.name}</option>
                ))}
              </select>
            </div>

            {/* QA Person */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">QA Person</label>
              <select
                name="QA"
                value={form.QA}
                onChange={handleChange}
                className="w-full bg-gray-100 rounded p-2"
              >
                <option value="">Select QA</option>
                {qaOptions.map((user) => (
                  <option key={user._id} value={user._id}>{user.name}</option>
                ))}
              </select>
            </div>
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team Lead</label>
              <select
                name="TL"
                value={form.TL}
                onChange={handleChange}
                className="w-full bg-gray-100 rounded p-2"
              >
                <option value="">Select TL</option>
                <option value="Ashish Ghori">Ashish Ghori</option>
                <option value="Rahul">Rahul</option>
                <option value="Suraj Kumar">Suraj Kumar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Developers</label>
              <Select
                isMulti
                name="Developers"
                options={options}
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Select Developers..."
                onChange={handleDevelopersChange}
              />
            </div> */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">BAU Person</label>
              <select
                name="BAUPerson"
                value={form.BAUPerson}
                onChange={handleChange}
                className="w-full bg-gray-100 rounded p-2"
              >
                <option value="">Select Person</option>
                <option value="Aakanksha Dixit">Aakanksha Dixit</option>
              </select>
            </div>
    
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="StartDate"
                value={form.StartDate}
                onChange={handleChange}
                className="w-full bg-gray-100 rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                name="EndDate"
                value={form.EndDate}
                onChange={handleChange}
                className="w-full bg-gray-100 rounded p-2"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Save Project
          </button>
        </div>
      </div>
    </div>
  );
}
