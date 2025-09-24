import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import Select from "react-select";

export default function UpdateProjectModal({ isOpen, onClose, project, onUpdate }) {
    const [formData, setFormData] = useState({
        ProjectName: "",
        ProjectCode: "", // only the suffix
        Frequency: "",
        Department: "",
        PM: "",
        BDE: "",
        Priority: "",
        ProjectType: "",
        Timeline: "",
        Description: "",
        SOWFile: null,
        SampleFiles: [],
    });

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
                    // Reset PM only if department changes
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

    // Load project values into form
    useEffect(() => {
        if (project) {
            setFormData(prev => ({
                ...prev,
                ProjectName: project.ProjectName || "",
                ProjectCode: project.ProjectCode?.replace(/^ACT/, "") || "", // remove ACT for input
                Frequency: project.Frequency || "",
                Department: project.Department?._id || "",
                Priority: project.Priority || "",
                ProjectType: project.ProjectType || "",
                PM: project.PM?._id || "",
                BDE: project.BDE?._id || "",
                Timeline: project.Timeline || "",
                Description: project.Description || "",
                SOWFile: null,
                SampleFiles: [],
            }));
        }
    }, [project]);

    

    // Handle text input
    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle file inputs
    const handleFileChange = e => {
        const { name, files } = e.target;
        if (name === "SOWFile") setFormData(prev => ({ ...prev, SOWFile: files[0] }));
        else if (name === "SampleFiles") setFormData(prev => ({ ...prev, SampleFiles: Array.from(files) }));
    };

    // Submit update
    const handleSubmit = async e => {
        e.preventDefault();
        if (!project) return;

        try {
            const data = new FormData();

            Object.keys(formData).forEach(key => {
                if (!["SOWFile", "SampleFiles", "removeSOW", "removeSamples"].includes(key)) {
                    data.append(key, formData[key]);
                }
            });

            if (formData.SOWFile) data.append("SOWFile", formData.SOWFile);
            if (formData.SampleFiles.length > 0) {
                formData.SampleFiles.forEach(file => data.append("SampleFiles", file));
            }

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
                alert("Failed to update project.");
            }
        } catch (error) {
            console.error("Error updating project:", error);
            alert("Server error while updating project.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10">
            <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl relative overflow-y-auto max-h-[90vh]">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <FaTimes size={20} />
                </button>

                <h2 className="text-xl font-bold mb-6">Update Project</h2>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Project Name */}
                    <label className="block text-gray-700 font-semibold mb-2">Project Name</label>
                    <input type="text" name="ProjectName" value={formData.ProjectName} onChange={handleChange} className="w-full border rounded p-2" />

                    {/* Project Code with ACT prefix */}
                    <label className="block text-gray-700 font-semibold mb-2">Project Code</label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l bg-gray-200 text-gray-700">ACT</span>
                        <input
                            type="text"
                            name="ProjectCode"
                            value={formData.ProjectCode}
                            onChange={handleChange}
                            placeholder="Project Code"
                            className="flex-1 border rounded-r p-2"
                        />
                    </div>

                    {/* Frequency */}
                    <label className="block text-gray-700 font-semibold mb-2">Select Frequency</label>
                    <select name="Frequency" value={formData.Frequency} onChange={handleChange} className="w-full bg-gray-100 rounded p-2">
                        <option value="" disabled>Select Frequency</option>
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="OneTime">One-time</option>
                        <option value="Adhoc">Adhoc</option>
                    </select>

                    {/* Priority */}
                    <label className="block text-gray-700 font-semibold mb-2">Select Priority</label>
                    <select name="Priority" value={formData.Priority} onChange={handleChange} className="w-full border rounded p-2">
                        <option value="">Select Priority</option>
                        <option value="Low">Low</option>
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                    </select>

                    {/* Department */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Department</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select BDE</label>
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

                    {/* Timeline */}
                    <label>BAU Started</label>
                    <input type="date" name="Timeline" value={formData.Timeline} onChange={handleChange} className="w-full border rounded p-2" />

                    {/* Description */}
                    <label className="block text-gray-700 font-semibold mb-2">Description</label>
                    <textarea name="Description" value={formData.Description} onChange={handleChange} className="w-full border rounded p-2" />

                    {/* SOW File */}
                    <div>
                        <label className="block mb-1">SOW File</label>
                        <input type="file" name="SOWFile" onChange={handleFileChange} className="w-full" />
                        {project?.SOWFile?.length > 0 && (
                            <ul className="text-sm mt-1">
                                {project.SOWFile.map((file, idx) => (
                                    <li key={idx}>
                                        Version {idx + 1}:{" "}
                                        <a href={file} target="_blank" rel="noopener noreferrer" className="text-blue-600">View</a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Sample Files */}
                    <div>
                        <label className="block mb-1">Sample Files</label>
                        <input type="file" name="SampleFiles" multiple onChange={handleFileChange} className="w-full" />
                        {project?.SampleFiles?.length > 0 && (
                            <ul className="text-sm mt-1">
                                {project.SampleFiles.map((file, idx) => (
                                    <li key={idx}>
                                        Version {idx + 1}:{" "}
                                        <a href={file} target="_blank" rel="noopener noreferrer" className="text-blue-600">View</a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition">
                        Update Project
                    </button>
                </form>
            </div>
        </div>
    );
}
