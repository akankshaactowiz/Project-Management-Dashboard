import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

export default function UpdateProjectModal({ isOpen, onClose, project, onUpdate }) {
    const [formData, setFormData] = useState({
        ProjectName: "",
        ProjectCode: "",
        Frequency: "",
        Department: "",
        PM: "",
        BDE: "",
        Priority: "",
        ProjectType: "",
        Description: "",
    });
    const navigate = useNavigate();
    // ✅ separate state for files
    const [selectedSOWFile, setSelectedSOWFile] = useState(null);
    const [selectedSampleFiles, setSelectedSampleFiles] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [pmOptions, setPmOptions] = useState([]);
    const [bdeOptions, setBdeOptions] = useState([]);

    // Load departments when modal opens
    useEffect(() => {
        if (!isOpen) return;

        (async () => {
            try {
                const res = await fetch(
                    `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/department`,
                    { credentials: "include" }
                );
                const data = await res.json();
                const filtered = data.filter(d =>
                    ["R&D", "Operation", "BAU"].includes(d.department?.trim())
                );
                setDepartmentOptions(filtered);
            } catch (err) {
                console.error("Failed to load departments:", err);
                setDepartmentOptions([]);
            }
        })();
    }, [isOpen]);

    const departmentSelectOptions = departmentOptions.map(d => ({
        value: d._id,
        label: d.department,
    }));

    // Load PMs when Department changes
    useEffect(() => {
        const deptId = formData.Department;
        if (!deptId) {
            setPmOptions([]);
            setFormData(prev => ({ ...prev, PM: "" }));
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
                    setFormData(prev => ({ ...prev, PM: "" }));
                }
            } catch (err) {
                if (!cancelled) console.error("Failed to load PMs:", err);
                setPmOptions([]);
            }
        })();

        return () => { cancelled = true; };
    }, [formData.Department]);

    // Load BDEs
    useEffect(() => {
        if (!isOpen) return;

        (async () => {
            try {
                const res = await fetch(
                    `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users/bde`,
                    { credentials: "include" }
                );
                const data = await res.json();
                const options = (data.bdeUsers || []).map(u => ({
                    value: u._id,
                    label: u.name,
                }));
                setBdeOptions(options);
            } catch (err) {
                console.error("Failed to load BDEs:", err);
                setBdeOptions([]);
            }
        })();
    }, [isOpen]);

    // Load project values
    useEffect(() => {
        if (project) {
            setFormData({
                ProjectName: project.ProjectName || "",
                ProjectCode: project.ProjectCode?.replace(/^ACT/, "") || "",
                Frequency: project.Frequency || "",
                Department: project.Department?._id || "",
                Priority: project.Priority || "",
                ProjectType: project.ProjectType || "",
                PM: project.PM?._id || "",
                BDE: project.BDE?._id || "",
                Description: project.Description || "",
            });
            setSelectedSOWFile(null);
            setSelectedSampleFiles([]);
        }
    }, [project]);

    // Handle text input
    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle file inputs
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === "SOWFile") {
            setSelectedSOWFile(files[0] || null);
        }
        if (name === "SampleFiles") {
            setSelectedSampleFiles(Array.from(files));
        }
    };

    // Submit update
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!project) return;

        try {
            const data = new FormData();

            Object.keys(formData).forEach((key) => data.append(key, formData[key]));

            if (selectedSOWFile) data.append("SOWFile", selectedSOWFile);
            if (selectedSampleFiles.length > 0) {
                selectedSampleFiles.forEach((file) => data.append("SampleFiles", file));
            }

            const existingSOWIds = project.SOWFile.map((f) => f._id);
            const existingSampleIds = project.SampleFiles.map((f) => f._id);
            data.append("existingSOWIds", JSON.stringify(existingSOWIds));
            data.append("existingSampleIds", JSON.stringify(existingSampleIds));

            const response = await fetch(
                `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects/updates/${project._id}`,
                { method: "PUT", body: data, credentials: "include" }
            );

            const result = await response.json();
            if (result.success) {
                alert("Project updated successfully!");
                onUpdate(result.project);
                onClose();
            } else {
                alert(result.message || "Failed to update project.");
            }
        } catch (error) {
            console.error("Error updating project:", error);
            alert("Server error while updating project.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="bg-white w-full max-w-2xl p-6 rounded-2xl shadow-xl relative overflow-y-auto max-h-[90vh]">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <FaTimes size={20} />
                </button>

                <h2 className="text-xl font-bold mb-6">Project Details</h2>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Project Name */}
                    <label className="block text-gray-700 font-semibold mb-2">Project Name</label>
                    <input type="text" name="ProjectName" value={formData.ProjectName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" />

                    {/* Project Code */}
                    <label className="block text-gray-700 font-semibold mb-2">Project Code</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 pointer-events-none">ACT-</span>
                        <input
                            type="text"
                            name="ProjectCode"
                            value={formData.ProjectCode}
                            onChange={handleChange}
                            placeholder="Write Project Code"
                            className="w-full border border-gray-300 rounded p-2 pl-16"
                            required
                        />
                    </div>

                    {/* Frequency */}
                    <label className="block text-gray-700 font-semibold mb-2">Select Frequency</label>
                    <select name="Frequency" value={formData.Frequency} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2">
                        <option value="" disabled>Select Frequency</option>
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="OneTime">One-time</option>
                        <option value="Adhoc">Adhoc</option>
                    </select>

                    {/* Priority */}
                    <label className="block text-gray-700 font-semibold mb-2">Select Priority</label>
                    <select name="Priority" value={formData.Priority} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2">
                        <option value="">Select Priority</option>
                        <option value="Low">Low</option>
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                    </select>

                    {/* Department */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Select Department</label>
                        <Select
                            name="Department"
                            value={formData.Department ? { value: formData.Department, label: departmentSelectOptions.find(opt => opt.value === formData.Department)?.label } : null}
                            onChange={selected => handleChange({ target: { name: "Department", value: selected?.value || "" } })}
                            options={departmentSelectOptions}
                            placeholder="Select Department"
                            isClearable
                            isSearchable
                            className="w-full"
                        />
                    </div>

                    {/* Project Manager */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Project Manager</label>
                        <Select
                            name="PM"
                            value={formData.PM ? { value: formData.PM, label: pmOptions.find(u => u._id === formData.PM)?.name } : null}
                            onChange={selected => handleChange({ target: { name: "PM", value: selected?.value } })}
                            options={pmOptions.map(u => ({ value: u._id, label: u.name }))}
                            placeholder="Select Project Manager"
                            isClearable
                            isSearchable
                            className="w-full"
                        />
                    </div>

                    {/* BDE */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Select BDE</label>
                        <Select
                            name="BDE"
                            value={bdeOptions.find(opt => opt.value === formData.BDE) || null}
                            onChange={selected => handleChange({ target: { name: "BDE", value: selected?.value || "" } })}
                            options={bdeOptions}
                            placeholder="Select BDE"
                            isClearable
                            isSearchable
                            className="w-full"
                        />
                    </div>

                    {/* Description */}
                    <label className="block text-gray-700 font-semibold mb-2">Description</label>
                    <textarea name="Description" value={formData.Description} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" />

                    {/* SOW File */}
                    <div>
                        <label className="block mb-1">SOW File</label>
                        <div className="flex w-full items-center rounded-lg border border-gray-500 overflow-hidden">
                            <label
                                htmlFor="sow-file-update"
                                className="px-4 py-2 bg-gray-600 text-white cursor-pointer hover:bg-gray-700 transition-colors"
                            >
                                Choose File
                            </label>
                            <input
                                id="sow-file-update"
                                type="file"
                                name="SOWFile"
                                onChange={(e) => setSelectedSOWFile(e.target.files[0] || null)}
                                // onChange={handleFileChange}
                                className="hidden"
                                value="" // reset input for re-selection
                            />
                            <span className="flex-grow px-3 py-2 text-gray-700 text-sm bg-white truncate">
                                {selectedSOWFile ? selectedSOWFile.name : "No file chosen"}
                            </span>
                        </div>

                         <button
                            type="button"
                            className="text-blue-600 underline mt-1"
                             onClick={() => window.open(`/project/${project._id}/files`, "_blank")}
                        >
                            View Previous versions
                        </button>
                    </div>

                    {/* Sample Files */}
                    <div>
                        <label className="block mb-1">Sample Files</label>
                        <div className="flex w-full items-center rounded-lg border border-gray-500 overflow-hidden">
                            <label
                                htmlFor="sample-files-update"
                                className="px-4 py-2 bg-gray-600 text-white cursor-pointer hover:bg-gray-700 transition-colors"
                            >
                                Choose File
                            </label>
                            <input
                                id="sample-files-update"
                                type="file"
                                name="SampleFiles"
                                multiple
                                onChange={(e) => setSelectedSampleFiles(Array.from(e.target.files))}
                                // onChange={handleFileChange}
                                className="hidden"
                                value="" // reset input for re-selection
                            />
                            <span className="flex-grow px-3 py-2 text-gray-700 text-sm bg-white truncate">
                                {selectedSampleFiles.length > 0
                                    ? selectedSampleFiles.map((f) => f.name).join(", ")
                                    : "No file chosen"}
                            </span>
                        </div>

                        <button
                            type="button"
                            className="text-blue-600 underline mt-1"
                             onClick={() => window.open(`/project/${project._id}/files`, "_blank")}
                        >
                            View Previous versions
                        </button>
                    </div>



                    <div className="flex justify-end mt-4">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition">
                            Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
