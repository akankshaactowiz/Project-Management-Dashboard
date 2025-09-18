import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import { useAuth } from "../hooks/useAuth";

export default function ProjectDetails() {
  const {user} = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tlOptions, setTlOptions] = useState([]);
  const [devOptions, setDevOptions] = useState([]);
  const [qaOptions, setQaOptions] = useState([]);
  const [form, setForm] = useState({ TLId: "", DeveloperIds: [], QAPersonIds: [] });

  // Fetch project + available users
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch project details
        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects/${id}`,
          { credentials: "include" }
        );
        const data = await res.json();
        // console.log(data);
        setProject(data.project);
        setForm({
          TLId: data.TLId?._id || "",
          DeveloperIds: data.DeveloperIds?.map((d) => d._id) || [],
          QAPersonIds: data.QAPersonIds?.map((d) => d._id) || [],

        });

        // Fetch users for TL + Developers
        const userRes = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users/tl-dev`,
          { credentials: "include" }
        );
        const userData = await userRes.json();
        setTlOptions(userData.tlUsers);
        setDevOptions(userData.devUsers);
        setQaOptions(userData.qaPerson);

      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, [id]);

  // Handle update
  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects/${id}/update-team`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("Project team updated successfully");
        setProject(data.project);
        // setForm({ TLId: "", DeveloperIds: [] });
        navigate(`/project`);
      } else {
        alert(data.message || "Failed to update");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!project) return <p>Loading...</p>;

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6 mt-4">
        <h3 className="mb-4 bg-purple-200 text-purple-700 px-3 py-2 rounded-md text-md font-semibold">
          {project?.ProjectName || "Project Details"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Project Name:</p>
            <p className="font-semibold">
              {project.ProjectCode && project.ProjectName
                ? `[${project.ProjectCode}] ${project.ProjectName}`
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Frequency:</p>
            <p className="font-semibold">{project.Frequency}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Platform:</p>
            <p className="font-semibold">{project.Platform}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Project Manager</p>
            <p className="font-semibold">{project?.PMId?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Lead</label>
            <select
              value={form.TLId}
              onChange={(e) => setForm({ ...form, TLId: e.target.value })}
              className="w-full bg-gray-100 rounded p-2"
            >
              <option value="">Select TL</option>
              {tlOptions.map((user) => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
          </div>


          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Developers</label>
            <Select
            
              isMulti
              options={devOptions.map((u) => ({ value: u._id, label: u.name }))}
              value={devOptions
                .map((u) => ({ value: u._id, label: u.name }))
                .filter((opt) => form.DeveloperIds.includes(opt.value))}
              onChange={(selected) =>
                setForm({
                  ...form,
                  DeveloperIds: selected ? selected.map((s) => s.value) : [],
                })
              }
              placeholder="Select Developers"
            />
          </div> */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {user?.department === "QA" && user?.roleName === "Manager"
                ? "QA Persons"
                : "Developers"}
            </label>

            <Select
              isMulti
              options={
                user?.department === "QA" && user?.roleName === "Manager"
                  ? qaOptions.map((u) => ({ value: u._id, label: u.name })) // <-- from backend
                  : devOptions.map((u) => ({ value: u._id, label: u.name }))
              }
              value={
                user?.department === "QA" && user?.roleName === "Manager"
                  ? qaOptions
                    .map((u) => ({ value: u._id, label: u.name }))
                    .filter((opt) => form.QAPersonIds?.includes(opt.value))
                  : devOptions
                    .map((u) => ({ value: u._id, label: u.name }))
                    .filter((opt) => form.DeveloperIds?.includes(opt.value))
              }
              onChange={(selected) =>
                setForm({
                  ...form,
                  ...(user?.department === "QA" && user?.roleName === "Manager"
                    ? { QAPersonIds: selected ? selected.map((s) => s.value) : [] }
                    : { DeveloperIds: selected ? selected.map((s) => s.value) : [] }),
                })
              }
              placeholder={
                user?.department === "QA" && user?.roleName === "Manager"
                  ? "Select QA Persons"
                  : "Select Developers"
              }
            />
          </div>



          <div className="col-span-full flex justify-end mt-4">
            <button
              onClick={handleUpdate}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update Team
            </button>
          </div>

        </div>
      </div>
    </>
  );
}




