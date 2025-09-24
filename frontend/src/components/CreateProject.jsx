import { useState, useEffect } from "react";
import Select from "react-select";

export default function CreateProjectModal({ isOpen, onClose }) {
  // --- Option states ---
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pmOptions, setPmOptions] = useState([]); // managers for selected department
  const [bdeOptions, setBdeOptions] = useState([]); // business development execs

  // --- State for form fields ---
  const [form, setForm] = useState({
    ProjectCode: "",
    ProjectName: "",
    SOWLink: [], // array
    InputLinks: [], // array
    Frequency: "",
    Priority: "",
    Department: "",
    PM: "",
    BDE: "", // added BDE
    Timeline: "", // new field for target deadline
    Description: "",
  });

  // universal handler (works for regular inputs and for synthetic select calls)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // const departmentSelectOptions = departmentOptions.map((d) => ({
  //   value: d._id || d.id,
  //   label: d.department,  // <-- use 'department' key
  // }));


  // helper to normalize user arrays returned by various endpoints
  const normalizeUsersResponse = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.users)) return data.users;
    if (Array.isArray(data.pmUsers)) return data.pmUsers;
    if (Array.isArray(data.data)) return data.data;
    return [];
  };

  // --- Load departments (filter to only R&D and Operation) and BDE list when modal opens ---
  useEffect(() => {
    if (!isOpen) return;

    // fetch departments and filter to R&D, Operation, BAU
    (async () => {
      try {
        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/department`,
          { credentials: "include" }
        );
        const data = await res.json();

        console.log("Departments API response:", data);

        // Use `d.department` instead of `d.name`
        const filtered = data.filter((d) =>
          ["R&D", "Operation", "BAU"].includes(d.department?.trim())
        );

        setDepartmentOptions(filtered);
      } catch (err) {
        console.error("Failed to load departments:", err);
        setDepartmentOptions([]);
      }
    })();
  }, [isOpen]);

  // Map for React Select
  const departmentSelectOptions = departmentOptions.map((d) => ({
    value: d._id || d.id,
    label: d.department, // <-- use 'department' here
  }));


  // --- Fetch PMs (managers) when Department changes ---
  useEffect(() => {
    const deptId = form.Department;
    if (!deptId) {
      setPmOptions([]);
      setForm((prev) => ({ ...prev, PM: "" }));
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users/by-role?roleName=Manager&departmentId=${deptId}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (!cancelled) {
          setPmOptions(data || []);
          setForm((prev) => ({ ...prev, PM: "" }));
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load PMs:", err);
          setPmOptions([]);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [form.Department]);

  // Fetch BDE 
  useEffect(() => {
    if (!isOpen) return;

    (async () => {
      try {
        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users/bde`,
          { credentials: "include" }
        );
        const data = await res.json();

        const options = (data.bdeUsers || []).map((u) => ({
          value: u._id,
          label: u.name,
        }));

        setBdeOptions(options);
      } catch (err) {
        console.error("Failed to load BDE list:", err);
        setBdeOptions([]);
      }
    })();
  }, [isOpen]);



  // --- Save handler (include DepartmentId and BDEId) ---
  const handleSave = async () => {
    try {
      const payload = {
        ProjectCode: form.ProjectCode,
        ProjectName: form.ProjectName,
        Frequency: form.Frequency,
        Priority: form.Priority,
        PMId: form.PM || null,
        BDEId: form.BDE || null,
        DepartmentId: form.Department || null,
        SOWFile: form.SOWLink, // schema expects SOWFile
        SampleFiles: form.InputLinks, // schema expects SampleFiles
        Timeline: form.Timeline,
        Description: form.Description,
      };

      const res = await fetch(
        `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (data.success) {
        alert("Project created successfully!");
        onClose();
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Failed to save project");
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
            {/* Project Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Code
              </label>
              <input
                type="text"
                name="ProjectCode"
                value={form.ProjectCode}
                onChange={handleChange}
                placeholder="Write Project Code"
                className="w-full bg-gray-100 rounded p-2"
                required
              />
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                name="ProjectName"
                value={form.ProjectName}
                onChange={handleChange}
                placeholder="Project Name"
                className="w-full bg-gray-100 rounded p-2"
              />
            </div>

            {/* SOW Links */}
            <div>
              <label className="block font-medium mb-1">SOW Links</label>
              {form.SOWLink.map((link, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder={`Link ${idx + 1}`}
                    value={link}
                    onChange={(e) => {
                      const updated = [...form.SOWLink];
                      updated[idx] = e.target.value;
                      setForm({ ...form, SOWLink: updated });
                    }}
                    className="flex-1 bg-gray-100 rounded p-2"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = form.SOWLink.filter((_, i) => i !== idx);
                      setForm({ ...form, SOWLink: updated });
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setForm({ ...form, SOWLink: [...form.SOWLink, ""] })
                }
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                + Add Link
              </button>
            </div>

            {/* Sample Files Links */}
            <div>
              <label className="block font-medium mb-1">Sample Files</label>
              {form.InputLinks.map((link, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder={`Link ${idx + 1}`}
                    value={link}
                    onChange={(e) => {
                      const updated = [...form.InputLinks];
                      updated[idx] = e.target.value;
                      setForm({ ...form, InputLinks: updated });
                    }}
                    className="flex-1 bg-gray-100 rounded p-2"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = form.InputLinks.filter((_, i) => i !== idx);
                      setForm({ ...form, InputLinks: updated });
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setForm({ ...form, InputLinks: [...form.InputLinks, ""] })
                }
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                + Add Link
              </button>
            </div>

            {/* Frequency */}
            <div>
              <label className="block font-medium mb-1">Project Frequency</label>
              <select
                name="Frequency"
                value={form.Frequency}
                onChange={handleChange}
                className="w-full bg-gray-100 rounded p-2"
              >
                <option value="" disabled>
                  Select Frequency
                </option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="OneTime">One-time</option>
                <option value="Adhoc">Adhoc</option>
              </select>

              {form.Frequency === "OneTime" && (
                <div>
                  <label className="block font-medium mb-1">Target Deadline</label>
                  <input
                    type="date"
                    value={form.Timeline || ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, Timeline: e.target.value }))
                    }
                    className="w-full bg-gray-100 rounded p-2"
                  />
                </div>
              )}

            </div>

            {/* Department */}
            <Select
              name="Department"
              value={
                form.Department
                  ? {
                    value: form.Department,
                    label: departmentSelectOptions.find((opt) => opt.value === form.Department)?.label,
                  }
                  : null
              }
              onChange={(selected) =>
                handleChange({ target: { name: "Department", value: selected?.value || "" } })
              }
              options={departmentSelectOptions}
              placeholder="Select Department"
              isClearable
              isSearchable
              className="w-full"
            />



            {/* Project Manager */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Manager
              </label>
              <Select
                name="PM"
                value={
                  form.PM
                    ? { value: form.PM, label: pmOptions.find(u => u._id === form.PM)?.name }
                    : null
                }
                onChange={(selected) =>
                  handleChange({ target: { name: "PM", value: selected?.value } })
                }
                options={pmOptions.map(u => ({ value: u._id, label: u.name }))}
                placeholder={departmentOptions.length ? "Select PM" : "Select Department first"}
                isClearable
                isSearchable
                className="w-full"
              />

            </div>

            {/* Business Development Executive */}
            <Select
              name="BDE"
              value={bdeOptions.find((opt) => opt.value === form.BDE) || null}
              onChange={(selected) =>
                handleChange({ target: { name: "BDE", value: selected?.value || "" } })
              }
              options={bdeOptions}
              placeholder="Select BDE"
              isClearable
              isSearchable
              className="w-full"
            />

            <div>
              <label className="block font-medium mb-1">Project Priority</label>
              <select
                name="Priority"
                value={form.Priority}
                onChange={handleChange}
                className="w-full bg-gray-100 rounded p-2"
              >
                <option value="" disabled>
                  Select Priority
                </option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label htmlFor="bau-started" className="block mb-1">BAU started</label>
              <input
                id="bau-started"
                type="datetime-local"
                onChange={(e) => setForm({ ...form, BAUstarted: e.target.value })}
                className="flex-1 bg-gray-100 rounded p-2"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Description / Additional Info</label>
              <textarea
                value={form.Description}
                onChange={(e) => setForm((prev) => ({ ...prev, Description: e.target.value }))}
                placeholder="Enter description..."
                className="w-full bg-gray-100 rounded p-2"
                rows={3}
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
