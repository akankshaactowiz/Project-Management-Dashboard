import { useState, useEffect } from "react";
import Select from "react-select";
import { getData } from "country-list";

export default function CreateProjectModal({ isOpen, onClose }) {
  // --- Option states ---
  const [domainName, setDomainName] = useState("");
  const [feedName, setFeedName] = useState("");
  const [applicationType, setApplicationType] = useState("");
  const [country, setCountry] = useState(null);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pmOptions, setPmOptions] = useState([]); // managers for selected department
  const [bdeOptions, setBdeOptions] = useState([]); // business development execs
  const countryOptions = getData().map((c) => ({
    value: c.code,
    label: c.name,
  }));
  // --- State for form fields ---
  const [form, setForm] = useState({
    ProjectCode: "",
    ProjectName: "",

    SOWFile: "", // array
    // InputFiles: [],
    InputFiles: [null],
    Frequency: "",
    Priority: "",
    ProjectType: "",
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
  // const handleSave = async () => {
  //   try {
  //     const payload = {
  //       ProjectCode: form.ProjectCode,
  //       ProjectName: form.ProjectName,
  //       Frequency: form.Frequency,
  //       Priority: form.Priority,
  //       ProjectType: form.ProjectType,
  //       PMId: form.PM || null,
  //       BDEId: form.BDE || null,
  //       DepartmentId: form.Department || null,
  //       SOWFile: form.SOWFile, // schema expects SOWFile
  //       SampleFiles: form.InputFiles, // schema expects SampleFiles
  //       Timeline: form.Timeline,
  //       Description: form.Description,
  //     };

  //     const res = await fetch(
  //       `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects`,
  //       {
  //         method: "POST",
  //         credentials: "include",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(payload),
  //       }
  //     );

  //     const data = await res.json();
  //     if (data.success) {
  //       alert("Project created successfully!");
  //       onClose();
  //     } else {
  //       alert(data.message || "Something went wrong");
  //     }
  //   } catch (error) {
  //     console.error("Error saving project:", error);
  //     alert("Failed to save project");
  //   }
  // };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      // Project fields
      formData.append("ProjectCode", form.ProjectCode);
      formData.append("ProjectName", form.ProjectName);
      formData.append("Frequency", form.Frequency);
      formData.append("Priority", form.Priority);
      formData.append("ProjectType", form.ProjectType);
      formData.append("PMId", form.PM || "");
      formData.append("BDEId", form.BDE || "");
      formData.append("DepartmentId", form.Department || "");
      formData.append("Timeline", form.Timeline || "");
      formData.append("Description", form.Description || "");

      // Files
      if (form.SOWFile) formData.append("SOWFile", form.SOWFile);
      form.InputFiles.forEach((file) => {
        if (file) formData.append("SampleFiles", file);
      });

      // Initial feed fields
      formData.append("FeedName", feedName);
      formData.append("DomainName", domainName);
      formData.append("ApplicationType", applicationType);
      formData.append("CountryName", country?.value || "");

      // --- Create project + initial feed on backend ---
      const res = await fetch(
        `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const projectData = await res.json();
      if (!projectData.success) throw new Error(projectData.message || "Failed to create project");

      alert("Project and initial feed created successfully!");
      onClose();
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
              <div className="relative">
                {/* Prefix inside input */}
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 pointer-events-none">
                  ACT-
                </span>
                <input
                  type="text"
                  name="ProjectCode"
                  value={form.ProjectCode} // user types only the suffix
                  onChange={handleChange}
                  placeholder="Write Project Code"
                  className="w-full border border-gray-300 rounded p-2 pl-16" // pl-16 to make space for prefix
                  required
                />
              </div>
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
                className="w-full border border-gray-300 rounded-r p-2"
              />
            </div>

            {/* SOW Links */}
            {/* <div>
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
            </div> */}

            {/* Sample Files Links */}
            {/* <div>
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
            </div> */}
            {/* SOW Document (Single File) */}
            <div>
              <label className="block font-medium mb-1">SOW Document</label>
              <div className="flex w-full rounded-lg border border-gray-500">
                {/* The custom styled button */}
                <label htmlFor="sow-file" className="px-4 py-2 bg-gray-500 text-white rounded-l-md cursor-pointer transition-colors">
                  Choose File
                </label>

                {/* The hidden input field */}
                <input
                  id="sow-file"
                  type="file"
                  onChange={(e) => setForm({ ...form, SOWFile: e.target.files[0] })}
                  className="hidden"
                  required
                />

                {/* The text area displaying the filename or placeholder */}
                <span className="flex-grow px-4 py-2 text-gray-500 bg-white rounded-r-md">
                  {form.SOWFile ? form.SOWFile.name : 'no file chosen'}
                </span>
              </div>
            </div>

            {/* Sample File Attachments (Multiple) */}
            <div>
              <label className="block font-medium mb-1">Sample Files</label>

              {form.InputFiles.map((file, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                  {/* File input component with custom styling */}
                  <div className="flex flex-1 rounded-lg border border-gray-500">
                    <label htmlFor={`input-file-${idx}`} className="px-4 py-2 bg-gray-500 text-white rounded-l-md cursor-pointer transition-colors">
                      Choose File
                    </label>
                    <input
                      id={`input-file-${idx}`}
                      type="file"
                      onChange={(e) => {
                        const updated = [...form.InputFiles];
                        updated[idx] = e.target.files[0];
                        setForm({ ...form, InputFiles: updated });
                      }}
                      className="hidden"
                      required
                    />
                    <span className="flex-grow px-4 py-2 text-gray-500 bg-white rounded-r-md">
                      {file ? file.name : 'no file chosen'}
                    </span>
                  </div>

                  {/* The remove button */}
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = form.InputFiles.filter((_, i) => i !== idx);
                        setForm({ ...form, InputFiles: updated });
                      }}
                      className="flex-shrink-0 px-3 py-1 bg-gray-500 text-white  h-8 w-8 flex items-center justify-center hover:bg-gray-600 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              {/* The "Add Attachment" button */}
              <button
                type="button"
                onClick={() =>
                  setForm({ ...form, InputFiles: [...form.InputFiles, null] })
                }
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                + Add Attachment
              </button>
            </div>


            {/* Project Type */}
            <div>
              <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-1">
                Project Type
              </label>
              <select
                name="ProjectType"
                value={form.ProjectType}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-r p-2"
              >
                <option value="" disabled>
                  Select Project Type
                </option>
                <option value="POC">POC</option>
                <option value="BAU">BAU</option>
                <option value="R&D">R&D</option>
                <option value="Adhoc">Adhoc</option>
              </select>
            </div>

            {/* Frequency */}
            <div>
              <label className="block font-medium mb-1">Project Frequency</label>
              <select
                name="Frequency"
                value={form.Frequency}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-r p-2"
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

            {/* Priority */}

            <div>
              <label className="block font-medium mb-1">Project Priority</label>
              <select
                name="Priority"
                value={form.Priority}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-r p-2"
              >
                <option value="" disabled>
                  Select Priority
                </option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Department
              </label>
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
            </div>



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
                placeholder="Select Project Manager"
                isClearable
                isSearchable
                className="w-full"
              />

            </div>

            {/* Business Development Executive */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select BDE</label>
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
            </div>


            <div>
              <label className="block font-medium mb-1">Description / Additional Info</label>
              <textarea
                value={form.Description}
                onChange={(e) => setForm((prev) => ({ ...prev, Description: e.target.value }))}
                placeholder="Enter description..."
                className="w-full border border-gray-300 rounded-r p-2"
                rows={3}
              />
            </div>

            {/* <div>
              <label htmlFor="bau-started" className="block mb-1">BAU started</label>
              <input
                id="bau-started"
                type="datetime-local"
                onChange={(e) => setForm({ ...form, BAUstarted: e.target.value })}
                className="flex-1 bg-gray-100 rounded p-2"
              />
            </div> */}
          </div>
        </div>

        {/* Feed Details */}
        <div className="mb-6">
          <h3 className="mb-4 bg-purple-200 text-purple-700 px-3 py-2 rounded-md text-md font-semibold">
            Feed Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feed Name
              </label>
              <input
                type="text"
                value={feedName}
                onChange={(e) => setFeedName(e.target.value)}
                placeholder="Feed Name"
                className="w-full border border-gray-300 rounded-r p-2"
              />
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Domain Name
              </label>
              <input
                type="text"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                placeholder="Domain Name"
                className="w-full border border-gray-300 rounded-r p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Type
              </label>
              <select
                value={applicationType}
                onChange={(e) => setApplicationType(e.target.value)}
                className="w-full border border-gray-300 rounded-r p-2"
              >
                <option value="" disabled>
                  Select type
                </option>
                <option value="Web">Web</option>
                <option value="Mobile">App</option>
              </select>
            </div>


            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country Name
              </label>
              <Select
                name="country"
                options={countryOptions}
                value={country}
                onChange={setCountry}
                isSearchable
                placeholder="Select Country"
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
