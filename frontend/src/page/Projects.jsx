import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaFilePdf, FaFileCsv } from "react-icons/fa6";
import { RiFileExcel2Fill } from "react-icons/ri";
import { LuFileJson } from "react-icons/lu";
import Pagination from "../components/Pagination";
import Img from "../assets/no-data-found.svg";
import { exportData } from "../utils/exportUtils";
import { useAuth } from "../hooks/useAuth";
import Model from "../components/CreateProject";
import AssignQAModal from "../components/AssignToQa";

// import QaActionsModal from "../components/QAActionModel";

const tabs = [
  "Projects",
  "Today",
  "Tomorrow",
  "Yesterday",
  "This Week",
  "Last Week",
  "Next Week",
  "This Month",
  "Next Month",
  "Last Month",
  "Date",
];

// const statusTabs = ["All", "New", "Under Development", "assigned_to_qa", "qa_passed", "qa_failed", "Completed"];
const statusTabs = [
  { key: "All", label: "All" },
  { key: "New", label: "New" },
  { key: "Under Development", label: "Under Development" },
  { key: "assigned_to_qa", label: "Assigned to QA" },
  { key: "qa_passed", label: "QA Passed" },
  { key: "qa_failed", label: "QA Failed" },
  { key: "Completed", label: "Completed" },
];
export default function Projects() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Projects");
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qaData, setQaData] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const [qaModalOpen, setQaModalOpen] = useState(false);

  const [openRow, setOpenRow] = useState(null);
  // const [selectedProject, setSelectedProject] = useState(null);

  // const canCreateProject = user?.permissions?.some(
  //   (perm) => perm.module === "Project" && perm.actions.includes("create")
  // );

  const canCreateProject =
    user?.permissions?.some(
      (perm) => perm.module === "Project" && perm.actions.includes("create")
    ) &&
    !(user?.department === "QA" && user?.roleName === "Manager");


  // Fetch projects using filters

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: activeStatus !== "All" ? activeStatus : "",
        date_range: activeTab.toLowerCase().replace(" ", "_"),
        page: currentPage.toString(),
        pageSize: entries.toString(),
        search: search || "",
        department: user.department || "",
      });

      const response = await fetch(
        `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects?${params.toString()}`,
        {
          credentials: "include",
        }
      );
      const result = await response.json();
      if (response.ok) {
        setData(result.data || []);
        setPageSize(result.pageSize);
        setCurrentPage(result.page || 1); 
        setTotalPages(Math.ceil(result.total / result.pageSize) || 1);
        // fetchProjects();
      } else {
        console.error("Failed to fetch projects:", result.message);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProjects();
  }, [activeTab, activeStatus, entries, pageSize, currentPage, search]);

  const columns = [
    "No",
    "Project Code",
    "Project Name",
    "Frequency",
    "Platform",
    "Status",
    "BAU",
    "POC",
    "PM",
    "TL",
    "Developer",
    "QA",
    "BAU Person",
    "Framework type",
    "QA Report Count",
    "Manage By",
    "QA Rules",
    // "DB Status",
    // "DB Type",
    "Created Date",

    "Actions",
  ];

  const onPageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchProjects(newPage);
  };

  return (
    <>
      <div className="px-4 pt-2">
        {/* Tabs */}
        <div className="bg-gray-100 px-2 py-2 rounded-md mb-4 flex flex-wrap gap-1 select-none">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded font-medium ${activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700"
                }`}
            >
              {tab}
            </button>
          ))}
          {canCreateProject && (
            <button
              className="ml-auto bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded transition"
              onClick={() => setIsModalOpen(true)}
            >
              + Create Project
            </button>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <Model isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        )}

        {/* Status Tabs */}
        {user?.department !== "Sales" && (
          
        <div className="border-b border-gray-200 mb-4 overflow-x-auto whitespace-nowrap">
          {statusTabs.map((status) => (
            <button
              key={status.key}
              onClick={() => setActiveStatus(status.key)}
              className={`inline-block px-4 py-2 text-xs font-medium transition-colors duration-200 ${activeStatus === status.key ? "border-b-2 border-purple-800 text-purple-800" : "text-gray-500"
                }`}
            >
              {status.label}
            </button>
          ))}
        </div>
        )}

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-3">
          <div className="flex items-center space-x-2">
            <label htmlFor="entries" className="text-gray-700">
              Show
            </label>
            <select
              id="entries"
              value={entries}
              onChange={(e) => {
                setEntries(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded px-2 py-1"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-gray-700">entries</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded pl-8 pr-3 py-1 text-sm"
              />
              <svg
                className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
            </div>

            <button
              title="PDF"
              className="text-gray-600 hover:text-gray-900"
              onClick={() => exportData("pdf", data, "projects")}
            >
              <FaFilePdf size={16} className="text-red-700" />
            </button>
            <button
              title="Excel"
              className="text-green-600 hover:text-green-800"
              onClick={() => exportData("excel", data, "projects")}
            >
              <RiFileExcel2Fill size={16} className="text-green-600" />
            </button>
            <button
              title="CSV"
              className="text-blue-600 hover:text-blue-800"
              onClick={() => exportData("csv", data, "projects")}
            >
              <FaFileCsv size={16} className="text-blue-600" />
            </button>
            <button
              title="JSON"
              className="text-red-600 hover:text-red-800"
              onClick={() => exportData("json", data, "projects")}
            >
              <LuFileJson size={16} className="text-yellow-500" />
            </button>
          </div>
        </div>

        {/* Table */}
        {user?.department === "Sales" && (
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 text-gray-700 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">No</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Project Code</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Project Name</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">SOW File</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Sample Files</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Frequency</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">PM</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Created By</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Created Date</th>

                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center p-4 text-gray-500"
                    >
                      <div className="flex justify-center items-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : data.length > 0 ? (
                  data.map((row, idx) => (
                    <tr
                      key={row._id || idx}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-3 py-2">{(currentPage - 1) * pageSize + idx + 1}</td>
                      <td className="px-3 py-2">{row.ProjectCode ?? "-"}</td>
                      <td
                        className="px-3 py-2"
                      >
                        {row.ProjectName ?? "-"}
                      </td>
                      <td className="px-3 py-2" >
                        <a href={row.SOWFile} className="text-blue-600 hover:text-blue-800" target="_blank">
                          {row.SOWFile ?? "-"}
                        </a>
                      </td>
                      {/* <td className="px-3 py-2"> 
                      <a href={row.SampleFiles} className="text-blue-600 hover:text-blue-800" target="_blank">
                        {row.SampleFiles ?? "-"}
                      </a>
                    </td> */}
                      <td className="px-3 py-2 relative">
                        {row.SampleFiles && row.SampleFiles.length > 0 ? (
                          <div
                            style={{ display: "inline-block", position: "relative" }}
                            onMouseEnter={() => setOpenRow(idx)}
                            onMouseLeave={() => setOpenRow(null)}
                          >
                            <span
                              style={{ cursor: "pointer", color: "#2563eb", textDecoration: "underline" }}
                            >
                              {row.SampleFiles.length === 1 ? "View File" : `${row.SampleFiles.length} Files`}
                            </span>

                            {openRow === idx && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "100%",
                                  left: 0,
                                  marginTop: "0.25rem",
                                  minWidth: "180px",
                                  maxHeight: "200px",
                                  overflowY: "auto",
                                  backgroundColor: "#fff",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "0.5rem",
                                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                                  padding: "0.5rem",
                                  zIndex: 50,
                                }}
                              >
                                <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
                                  {row.SampleFiles.map((file, fileIdx) => (
                                    <li key={fileIdx} style={{ marginBottom: "0.25rem" }}>
                                      <a
                                        href={file}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          display: "block",
                                          color: "#2563eb",
                                          textDecoration: "none",
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                        }}
                                      >
                                        {/* Link {fileIdx + 1} */}
                                        {file}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: "#9ca3af" }}>-</span>
                        )}
                      </td>

                      <td className="px-3 py-2">{row.Frequency ?? "-"}</td>
                      <td className="px-3 py-2">{row.PMId?.name ?? "-"}</td>
                      <td className="px-3 py-2">{row.CreatedBy?.name ?? "-"}</td>
                      <td className="px-3 py-2">{new Date(row.CreatedDate).toLocaleDateString() ?? "-"}</td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center p-8 text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center gap-3">
                        <img
                          src={Img}
                          alt="No data"
                          className="w-32 h-32 object-contain opacity-80"
                        />
                        <p className="font-semibold text-lg text-gray-600">
                          No Data Found
                        </p>
                        <p className="text-sm text-gray-400">
                          Try adding new projects to see them here.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {user?.department !== "Sales" && (

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* <thead className="bg-gray-100 text-gray-700 sticky top-0">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2 text-left font-semibold whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead> */}
              <thead className="bg-gray-100 text-gray-700 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">No</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Project Code</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Project Name</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Frequency</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Platform</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Status</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">BAU</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">POC</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">PM</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">TL</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Developer</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">QA</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">BAU Person</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Framework type</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">QA Report Count</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Manage By</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">QA Rules</th>
                  {/* <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">DB Status</th>
            <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">DB Type</th> */}
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Created Date</th>
                  {user.roleName === "Developer" && (

                    <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center p-4 text-gray-500"
                    >
                      <div className="flex justify-center items-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : data.length > 0 ? (
                  data.map((row, idx) => (
                    <tr
                      key={row._id || idx}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    // className="cursor-pointer hover:bg-gray-50 hover:text-blue-600"
                    // onClick={() => navigate(`/project/${row._id}`)}
                    >
                      <td className="px-3 py-2" >{(currentPage - 1) * pageSize + idx + 1}</td>
                      <td className="px-3 py-2">{row.ProjectCode ?? "-"}</td>
                      <td
                        className="px-3 py-2 cursor-pointer text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          if (user.roleName !== "Developer") {
                            navigate(`/project/${row._id}`);
                          }
                        }}
                      >
                        {row.ProjectName ?? "-"}
                      </td>
                      <td className="px-3 py-2">{row.Frequency ?? "-"}</td>
                      <td className="px-3 py-2">{row.Platform ?? "-"}</td>
                      {/* <td className="px-3 py-2">{row.Status ?? "-"}</td> */}
                      <td className="px-3 py-2">
                        {row.Status ? (
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap
                               ${row.Status.toLowerCase().includes("failed")
                                ? "bg-red-100 text-red-800"
                                : row.Status.toLowerCase().includes("passed")
                                  ? "bg-green-100 text-green-800"
                                  : row.Status.toLowerCase().includes("qa")
                                    ? "bg-purple-100 text-purple-800"
                                    : row.Status.toLowerCase().includes("development")
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-blue-100 text-blue-800"
                              }`}
                          >
                            {row.Status
                              .split("_")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>


                      <td className="px-3 py-2">{row.BAU ?? "-"}</td>
                      <td className="px-3 py-2">{row.POC ?? "-"}</td>
                      <td className="px-3 py-2">{row.PMId?.name ?? "-"}</td>
                      <td className="px-3 py-2">{row.TLId?.name ?? "-"}</td>
                      <td className="px-3 py-2">
                        {(row.DeveloperIds.map((dev) => dev.name) || []).join(", ")}
                      </td>
                      <td className="px-3 py-2">{row.QAId?.name ?? "-"}</td>
                      <td className="px-3 py-2">{row.BAUPersonId?.name ?? "-"}</td>
                      <td className="px-3 py-2">{row.FrameworkType ?? "-"}</td>
                      <td className="px-3 py-2">{row.reworkCount ?? "-"}</td>
                      <td className="px-3 py-2">{row.ManageBy ?? "-"}</td>
                      <td className="px-3 py-2">{row.QARules ?? "-"}</td>
                      <td className="px-3 py-2">{new Date(row.CreatedDate).toLocaleDateString() ?? "-"}</td>
                      {user.roleName === "Developer" && (
                        <td className="px-3 py-2 space-y-1">
                          {(() => {
                            const assigned =
                              row.qaStatus === "assigned_to_qa" ||
                              row.qaStatus === "qa_open" ||
                              row.qaStatus === "qa_passed";

                            return (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedProjectId(row._id);
                                    setAssignModalOpen(true);
                                  }}
                                  disabled={assigned}
                                  className={`w-full px-2 py-1 rounded text-sm text-white ${assigned
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-600"
                                    }`}
                                >
                                  {assigned ? "Assigned" : "Assign to QA"}
                                </button>
                                {/* {row.qaStatus === "qa_failed" && !assigned && (
                              )} */}

                                <AssignQAModal
                                  isAssigned={assigned}
                                  isOpen={assignModalOpen}
                                  projectId={selectedProjectId}
                                  onClose={() => setAssignModalOpen(false)}
                                  onAssign={async (projectId, { fileName, fileLink }) => {
                                    const formData = new FormData();
                                    if (fileName) formData.append("fileName", fileName);
                                    if (fileLink) formData.append("fileLink", fileLink);

                                    const res = await fetch(
                                      `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects/${projectId}/assign-to-qa`,
                                      { method: "POST", body: formData, credentials: "include" }
                                    );
                                    const result = await res.json();
                                    if (res.ok) {
                                      alert("File assigned to QA");
                                      setAssignModalOpen(false);
                                      fetchProjects();
                                    } else {
                                      alert(result.message || "Failed to assign file");
                                    }
                                  }}
                                />
                              </>
                            );
                          })()}
                        </td>
                        // <td className="px-3 py-2 space-y-1">
                        //   {(() => {
                        //     const assigned = data.find(p => p._id === row._id)?.developerStatus === "assigned_to_qa" || data.find(p => p._id === row._id)?.qaStatus === "assigned_to_qa";

                        //     return (
                        //       <>
                        //         <button
                        //           onClick={() => {
                        //             setSelectedProjectId(row._id);
                        //             setAssignModalOpen(true);
                        //           }}
                        //           disabled={assigned} // disable if already assigned
                        //           className={`w-full px-2 py-1 rounded text-sm text-white ${assigned ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                        //             }`}
                        //         >
                        //           {assigned ? "Assigned" : "Assign to QA"}
                        //         </button>

                        //         <AssignQAModal
                        //           isAssigned={assigned}
                        //           isOpen={assignModalOpen}
                        //           projectId={selectedProjectId}
                        //           onClose={() => setAssignModalOpen(false)}
                        //           onAssign={async (projectId, { fileName, fileLink }) => {
                        //             const formData = new FormData();
                        //             if (fileName) formData.append("fileName", fileName);
                        //             if (fileLink) formData.append("fileLink", fileLink);

                        //             const res = await fetch(
                        //               `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects/${projectId}/assign-to-qa`,
                        //               { method: "POST", body: formData, credentials: "include" }
                        //             );
                        //             const result = await res.json();
                        //             if (res.ok) {
                        //               alert("File assigned to QA");
                        //               setAssignModalOpen(false);
                        //               // fetchQAData();
                        //             } else {
                        //               alert(result.message || "Failed to assign file");
                        //             }
                        //           }}
                        //         />
                        //       </>
                        //     );
                        //   })()}
                        // </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center p-8 text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center gap-3">
                        <img
                          src={Img}
                          alt="No data"
                          className="w-32 h-32 object-contain opacity-80"
                        />
                        <p className="font-semibold text-lg text-gray-600">
                          No Data Found
                        </p>
                        <p className="text-sm text-gray-400">
                          Try adding new projects to see them here.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          
        />
      </div>
    </>
  );
}
