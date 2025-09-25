import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ProjectFilesPage() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await fetch(
                    `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects/${id}`,
                    { credentials: "include" }
                );
                const data = await res.json();
                if (data.success) {
                    setProject(data.data || data.project);
                }
            } catch (err) {
                console.error("Error fetching project files:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    if (loading) return <div className="p-6">Loading...</div>;
    if (!project) return <div className="p-6 text-red-500">Project not found</div>;

    return (
        <div className="p-8 bg-white min-h-screen">
            <h1 className="text-3xl font-extrabold mb-8 text-gray-900">
                Files for Project: <span className="text-blue-600">{project.ProjectName}</span> ({project.ProjectCode})
            </h1>

            {/* SOW Files */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">SOW Files</h2>
                {project.SOWFile && project.SOWFile.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-6 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 uppercase text-sm tracking-wide">
                                    <th className="px-4 py-3">Version</th>
                                    <th className="px-4 py-3">File</th>
                                    <th className="px-4 py-3">Uploaded At</th>
                                    <th className="px-4 py-3">Uploaded By</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {project.SOWFile.map((file, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-700">V{idx + 1}</td>
                                        <td className="px-4 py-3">{file.fileName?.split("/").pop()}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {file.uploadedAt ? new Date(file.uploadedAt).toLocaleString() : "-"}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{file.uploadedByName || file.uploadedBy?.name || "Unknown"}</td>
                                        <td className="px-4 py-3 flex gap-2">
                                            <button
                                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                                onClick={() => window.open(file.fileName || file.url, "_blank")}
                                            >
                                                View
                                            </button>
                                            <a
                                                href={file.fileName || file.url}
                                                download
                                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                            >
                                                Download
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500">No SOW files uploaded yet.</p>
                )}
            </div>

            {/* Sample Files */}
            <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Sample Files</h2>
                {project.SampleFiles && project.SampleFiles.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-6 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 uppercase text-sm tracking-wide">
                                    <th className="px-4 py-3">Version</th>
                                    <th className="px-4 py-3">File</th>
                                    <th className="px-4 py-3">Uploaded At</th>
                                    <th className="px-4 py-3">Uploaded By</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {project.SampleFiles.map((file, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-700">V{idx + 1}</td>
                                        <td className="px-4 py-3">{file.fileName?.split("/").pop()}</td>
                                        <td className="px-4 py-3 text-gray-600">{new Date(file.uploadedAt).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-gray-600">{file.uploadedBy?.name || "Unknown"}</td>
                                        <td className="px-4 py-3 flex gap-2">
                                            <button
                                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                                onClick={() => window.open(file.fileName || file.url, "_blank", "noopener,noreferrer")}
                                            >
                                                View
                                            </button>
                                            <a
                                                href={file.fileName}
                                                download
                                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                            >
                                                Download
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500">No Sample files uploaded yet.</p>
                )}
            </div>
        </div>
    );
}
