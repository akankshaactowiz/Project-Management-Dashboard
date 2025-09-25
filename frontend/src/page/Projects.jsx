import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaFilePdf, FaFileCsv } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { RiFileExcel2Fill } from "react-icons/ri";
import { LuFileJson } from "react-icons/lu";
import Pagination from "../components/Pagination";
import Img from "../assets/no-data-found.svg";
import { exportData } from "../utils/exportUtils";
import { useAuth } from "../hooks/useAuth";
import Model from "../components/CreateProject";
import AssignQAModal from "../components/AssignToQa";
import FeedModel from "../components/CreateFeed";
import UpdateProjectModal from "../components/UpdateProjectModel";
import { set } from "mongoose";

// import QaActionsModal from "../components/QAActionModel";
export default function Projects() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("All");
  const [salesActiveStatusTabs, setSalesActiveStatusTabs] = useState("All");
  const [activeSalesTab, setActiveSalesTab] = useState("All");
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

  const [feedModalOpen, setFeedModalOpen] = useState(false);
  const [feeds, setFeeds] = useState([]);
  const [status, setStatus] = useState("All");
  // const [qaModalOpen, setQaModalOpen] = useState(false);

  const [openRow, setOpenRow] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);



  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  // const [selectedProject, setSelectedProject] = useState(null);

  // const canCreateProject = user?.permissions?.some(
  //   (perm) => perm.module === "Project" && perm.actions.includes("create")
  // );

  const tabs = [
    "All",
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

  // sales tab filters
  const salesTabs = [
    "All",
    "BAU",
    "POC",
    "R&D",
    "Adhoc",
    "Once-off"
  ];

  const salesStatusTabs = [
    "All",
    "New",
    "Under Development",
    "On-Hold",
    "Development Completed",
    "Closed"
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

  const canCreateProject =
    user?.permissions?.some(
      (perm) => perm.module === "Project" && perm.actions.includes("create")
    ) &&
    !(user?.department === "QA" && user?.roleName === "Manager");


  const canCreateFeed = user?.permissions?.some(
    (perm) => perm.module === "Feed" && perm.actions.includes("create")
  );
  // Fetch projects using filters

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({

        status: activeStatus !== "All" ? activeStatus : "",
        tab: user.department === "Sales" && activeSalesTab !== "All" ? activeSalesTab : "", // send tab only for Sales
        statusTab: user.department === "Sales" && salesActiveStatusTabs !== "All" ? salesActiveStatusTabs : "",
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
  }, [activeTab, activeSalesTab, salesActiveStatusTabs,  activeStatus, entries, pageSize, currentPage, search]);



  //   const fetchProjects = async () => {
  //     try {
  //       setLoading(true);
  //       const params = new URLSearchParams({
  //         status: activeStatus !== "All" ? activeStatus : "",
  //         date_range: activeTab.toLowerCase().replace(" ", "_"),
  //         page: currentPage.toString(),
  //         pageSize: entries.toString(),
  //         search: search || "",
  //         department: user.department || "",
  //       });

  //       const response = await fetch(
  //         `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects?${params.toString()}`,
  //         { credentials: "include" }
  //       );
  //       const result = await response.json();

  //       if (response.ok) {
  //         // Flatten feeds for table display
  //         const feedRows = [];
  //         (result.data || []).forEach(project => {
  //           if (project.Feeds?.length > 0) {
  //             project.Feeds.forEach(feed => {
  //               feedRows.push({ ...feed, projectId: project }); // keep project info in projectId
  //             });
  //           } else {
  //             feedRows.push({ projectId: project }); // project with no feeds
  //           }
  //         });

  //         setData(feedRows);
  //         setPageSize(result.pageSize);
  //         setCurrentPage(result.page || 1);
  //         setTotalPages(Math.ceil(result.total / result.pageSize) || 1);
  //       } else {
  //         console.error("Failed to fetch projects:", result.message);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching projects:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  // useEffect(() => {
  //     fetchProjects();
  //   }, [activeTab, activeStatus, entries, pageSize, currentPage, search]);

  // const columns = [
  //   "No",
  //   "Project Code",
  //   "Project Name",
  //   "Frequency",
  //   "Platform",
  //   "Status",
  //   "BAU",
  //   "POC",
  //   "PM",
  //   "TL",
  //   "Developer",
  //   "QA",
  //   "BAU Person",
  //   "Framework type",
  //   "QA Report Count",
  //   "Manage By",
  //   "QA Rules",
  //   // "DB Status",
  //   // "DB Type",
  //   "Created Date",

  //   "Actions",
  // ];


  // useEffect(() => {
  //   const fetchFeeds = async () => {
  //     const status = activeStatus !== "All" ? activeStatus : "";
  //     try {
  //       setLoading(true);
  //       const res = await fetch(
  //         `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/feed?page=1&limit=10&status=${status}`,
  //         {
  //           credentials: "include",
  //         }
  //       );

  //       if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

  //       const data = await res.json();
  //       console.log(data)
  //       setFeeds(data.data || []);
  //       setTotalPages(data.totalPages || 1);
  //     } catch (err) {
  //       console.error("Error fetching feed data:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchFeeds();
  // }, [status]);

  // Manually define column headers
  // const columns = [
  //   "No",
  //   "Project Name",
  //   "Feed Name",
  //   "Frequency",
  //   "Platform",
  //   "Status",
  //   "BAU",
  //   "POC",
  //   "PM",
  //   "PC",
  //   "TL",
  //   "Developer",
  //   "QA",
  //   "BAU Person",
  //   "Feed ID",
  //   "Framework type",
  //   "QA Report Count",
  //   "Manage By",
  //   "QA Rules",
  //   "DB Status",
  //   "DB Type",
  //   "Created Date",
  //   "Created By",
  //   "Actions",

  // ];
  const role = user?.roleName;
  const baseColumns = ["No"];

  const roleColumns = {
    Superadmin: [
      "Frequency", "Platform", "BAU", "POC", "PM", "PC", "TL",
      "Developer", "QA", "BAU Person", "Feed ID", "Framework type",
      "QA Report Count", "Manage By", "QA Rules", "DB Status", "DB Type", "Created By",
    ],
    Manager: ["Project Name",
      "Feed Name",
      "Frequency",
      "Platform",
      "Status",
      "BAU",
      "POC",
      "PM",
      "PC",
      "TL",
      "Developer",
      "QA",
      "BAU Person",
      "SOW",
      "Sample Files",
      "Framework type",
      "QA Report Count",
      "Manage By",
      "QA Rules",
      "DB Status",
      "DB Type",
      "Created Date",
      "Project Created By",
      // "Actions"
    ],
    "Team Lead": ["Project Name",
      "Feed Name",
      "Feed ID",
      "Frequency",
      "Platform",
      "Status",
      "BAU",
      "POC",
      "PM",
      "PC",
      "TL",
      "Developer",
      "QA",
      "BAU Person",
      "SOW",
      "Sample Files",
      "Framework type",
      "QA Report Count",
      "Manage By",
      "QA Rules",
      "DB Status",
      "DB Type",
      "Created Date"],
    QA: ["QA Report Count", "QA Rules"],
    Developer: ["Framework type", "DB Status", "DB Type"],
  };

  const columns = [...baseColumns, ...(roleColumns[role] || [])];

  const handleUpdateProject = async (updatedData) => {
    // TODO: Send updatedData to API with project ID (selectedProject._id)
    console.log("Updated Project Data:", updatedData);
    setIsModalOpen(false);
  };

  let feedCounter = 1;
  return (
    <>
      <div className="px-4 pt-2">
        {/* Tabs */}
        <div className="bg-gray-100 px-2 py-2 rounded-md mb-4 flex flex-wrap gap-1 select-none">
          {user.department !== "Sales"
            && tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded font-medium ${activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-700"
                  }`}
              >
                {tab}
              </button>
            ))}
          {user.department === "Sales"
            && salesTabs.map((salesTab) => (
              <button
                key={salesTab}
                onClick={() => setActiveSalesTab(salesTab)}
                className={`px-3 py-1 rounded font-medium ${activeSalesTab === salesTab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-700"
                  }`}
              >
                {salesTab}
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

          {canCreateFeed && (
            <button
              className="ml-auto bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded transition"
              onClick={() => setFeedModalOpen(true)}
            >
              + Create Feed
            </button>
          )}
        </div>

        {feedModalOpen && (
          <FeedModel isOpen={feedModalOpen} onClose={() => setFeedModalOpen(false)} />
        )}

        {/* Modal */}
        {isModalOpen && (
          <Model isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        )}

        {/* Status Tabs */}
        {user?.department !== "Sales" && (
          <div className="border-b border-gray-200 mb-4 overflow-x-auto whitespace-nowrap">
            {statusTabs.map((status) => (
              <button
                key={status.key} // ✅ unique key
                onClick={() => setActiveStatus(status.key)}
                className={`inline-block px-4 py-2 text-md font-medium transition-colors duration-200 ${activeStatus === status.key
                  ? "border-b-2 border-purple-800 text-purple-800"
                  : "text-gray-500"
                  }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        )}

        {user?.department === "Sales" && (
          <div className="border-b border-gray-200 mb-4 overflow-x-auto whitespace-nowrap">
            {salesStatusTabs.map((salesStatusTab) => (
              <button
                key={salesStatusTab} // ✅ use string as key
                onClick={() => setSalesActiveStatusTabs(salesStatusTab)}
                className={`inline-block px-4 py-2 text-md font-medium transition-colors duration-200 ${salesActiveStatusTabs === salesStatusTab
                    ? "border-b-2 border-purple-800 text-purple-800"
                    : "text-gray-500"
                  }`}
              >
                {salesStatusTab}
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
        {user?.roleName === "Sales Head" && (
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 text-gray-700 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">No</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Project Code</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Project Name</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Project Type</th>
                  {/* <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">SOW File</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Sample Files</th> */}
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Attachments</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Frequency</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Project Status</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Project Manager</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">BDE</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Created By</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Created Date</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Action</th>

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
                      <td className="px-3 py-2">{row.ProjectType ?? "-"}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => navigate(`/project/${row._id}/files`)}
                          className="text-blue-600 hover:underline"
                        >
                          View Files
                        </button>
                      </td>

                      <td className="px-3 py-2">{row.Frequency ?? "-"}</td>
                      <td className="px-3 py-2">{row.Status ?? "-"}</td>
                      <td className="px-3 py-2">{row.PMId?.name ?? "-"}</td>
                      <td className="px-3 py-2">{row.BDEId?.name ?? "-"}</td>
                      <td className="px-3 py-2">{row.CreatedBy?.name ?? "-"}</td>
                      <td className="px-3 py-2">{new Date(row.CreatedDate).toLocaleDateString() ?? "-"}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => {
                            setSelectedProject(row);
                            setIsUpdateModalOpen(true);
                          }}
                        >
                          <FaEdit size={20} className="text-blue-600 hover:text-blue-800" />
                        </button>
                      </td>




                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={12}
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

            {/* Modal: render only once */}
            <UpdateProjectModal
              isOpen={isUpdateModalOpen}
              onClose={() => setIsUpdateModalOpen(false)}
              project={selectedProject}
              onUpdate={handleUpdateProject}
            />
          </div>
        )}

        {user?.roleName == "Sales Manager" && (
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 text-gray-700 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">No</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Project Code</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Project Name</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Project Type</th>
                  {/* <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">SOW File</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Sample Files</th> */}
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Material</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Frequency</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Project Status</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">PM</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">BDE</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Created By</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Created Date</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Action</th>

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
                      <td className="px-3 py-2">{row.ProjectType ?? "-"}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => navigate(`/project/${row._id}/files`)}
                          className="text-blue-600 hover:underline"
                        >
                          View Files
                        </button>
                      </td>

                      <td className="px-3 py-2">{row.Frequency ?? "-"}</td>
                      <td className="px-3 py-2">{row.Status ?? "-"}</td>
                      <td className="px-3 py-2">{row.PMId?.name ?? "-"}</td>
                      <td className="px-3 py-2">{row.BDEId?.name ?? "-"}</td>
                      <td className="px-3 py-2">{row.CreatedBy?.name ?? "-"}</td>
                      <td className="px-3 py-2">{new Date(row.CreatedDate).toLocaleDateString() ?? "-"}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => {
                            setSelectedProject(row);
                            setIsUpdateModalOpen(true);
                          }}
                        >
                          <FaEdit size={20} className="text-blue-600 hover:text-blue-800" />
                        </button>
                      </td>




                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={12}
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

            {/* Modal: render only once */}
            <UpdateProjectModal
              isOpen={isUpdateModalOpen}
              onClose={() => setIsUpdateModalOpen(false)}
              project={selectedProject}
              onUpdate={handleUpdateProject}
            />
          </div>
        )}

        {user?.roleName === "Business Development Executive" && (
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 text-gray-700 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">No</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Project Code</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Project Name</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Project Type</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Material</th>
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
                      // onClick={() => navigate(`/project/${row._id}`)}
                      >
                        {row.ProjectName ?? "-"}
                      </td>
                      <td className="px-3 py-2">{row.ProjectType ?? "-"}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => navigate(`/project/${row._id}/files`)}
                          className="text-blue-600 hover:underline"
                        >
                          View Files
                        </button>
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

        {user?.roleName === "Manager" && (
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200 ">
              <thead className="bg-gray-100 text-gray-700 sticky top-0">
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
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center p-8 text-gray-500">
                      <div className="flex justify-center items-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : data.length > 0 ? (
                  data.map((project, idx) =>
                    project.Feeds && project.Feeds.length > 0
                      ? project.Feeds.map((feed, feedIdx) => (
                        <tr
                          key={`${project._id}-${feed._id}`}
                          className={feedIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          {/* No */}
                          <td className="px-3 py-2">{feedCounter++}</td>

                          {/* Project Code + Name */}
                          <td className="px-3 py-2 whitespace-nowrap">
                            {project.ProjectCode || project.ProjectName
                              ? `[${project.ProjectCode ?? "-"}] ${project.ProjectName ?? "-"}`
                              : "-"}
                          </td>

                          {/* Feed Name */}
                          <td
                            className="px-3 py-2 text-blue-600 cursor-pointer hover:underline whitespace-nowrap"
                            onClick={() => (window.location.href = `/project/feed/${feed._id}`)}
                          >

                            {`${feedIdx + 1 ?? "-"} | ${project.ProjectType ?? "-"} | ${feed.DomainName ?? "-"} | ${feed.ApplicationType ?? "-"} | ${feed.CountryName ?? "-"} | ${project.ProjectName ?? "-"}`}
                          </td>

                          {/* Feed ID */}
                          {/* <td className="px-3 py-2">{feed.FeedId ?? "-"}</td> */}

                          {/* Frequency */}
                          <td className="px-3 py-2">{project.Frequency ?? "-"}</td>

                          {/* Platform */}
                          <td className="px-3 py-2 whitespace-nowrap">
                            {feed.DomainName && feed.ApplicationType && feed.CountryName
                              ? `${feed.DomainName} | ${feed.ApplicationType} | ${feed.CountryName}`
                              : "-"}
                          </td>

                          {/* Status */}
                          <td className="px-3 py-2">{feed.Status ?? "-"}</td>

                          {/* BAU */}
                          <td className="px-3 py-2">{feed.BAU ?? "-"}</td>

                          {/* POC */}
                          <td className="px-3 py-2">{feed.POC ?? "-"}</td>

                          {/* PM */}
                          <td className="px-3 py-2">{project.PMId?.name ?? "-"}</td>

                          {/* PC */}
                          <td className="px-3 py-2">{feed.PC ?? "-"}</td>

                          {/* TL */}
                          <td className="px-3 py-2">{feed.TLId?.name ?? "-"}</td>

                          {/* Developer */}
                          <td className="px-3 py-2">
                            {feed.DeveloperIds?.length
                              ? feed.DeveloperIds
                                .map((dev) => (dev?.name ? dev.name : dev._id ?? dev))
                                .join(", ")
                              : "-"}
                          </td>

                          {/* QA */}
                          <td className="px-3 py-2">{feed.QAId?.name ?? "-"}</td>

                          {/* BAU Person */}
                          <td className="px-3 py-2">{feed.BAUPersonId ?? "-"}</td>

                          {/* SOW Files */}
                          <td className="px-3 py-2">
                            {project.SOWFile && project.SOWFile.length > 0 ? (
                              <div className="inline-block relative">
                                <button
                                  // onClick={() =>
                                  //   setOpenDropdown(prev =>
                                  //     prev?.rowIdx === idx && prev?.col === "SOWFile" ? null : { rowIdx: idx, col: "SOWFile" }
                                  //   )
                                  // }
                                  onClick={() =>
                                    setOpenDropdown(prev =>
                                      prev?.rowId === project._id && prev?.feedId === feed?._id && prev?.col === "SOWFile"
                                        ? null
                                        : { rowId: project._id, feedId: feed?._id, col: "SOWFile" }
                                    )
                                  }
                                  className="text-blue-600 underline px-2 py-1 rounded hover:bg-gray-100"
                                >
                                  {project.SOWFile.length === 1 ? "View File" : `${project.SOWFile.length} Versions`}
                                </button>
                                {openDropdown?.rowId === project._id &&
                                  openDropdown?.feedId === feed?._id &&
                                  openDropdown?.col === "SOWFile" && (
                                    <div className="absolute left-0 mt-1 min-w-[180px] max-h-52 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg p-2 z-50">
                                      <ul className="p-0 m-0 list-none">
                                        {project.SOWFile.map((file, fileIdx) => (
                                          <li key={fileIdx} className="mb-1 last:mb-0">
                                            <a
                                              href={file}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              download
                                              className="block text-blue-600 hover:text-blue-800 hover:underline truncate"
                                              title={file}
                                            >
                                              Version {fileIdx + 1}
                                            </a>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>

                          {/* Sample Files */}
                          <td className="px-3 py-2 relative">
                            {project.SampleFiles && project.SampleFiles.length > 0 ? (
                              <div className="inline-block relative">
                                <button
                                  onClick={() =>
                                    setOpenDropdown(prev =>
                                      prev?.rowId === project._id && prev?.feedId === feed?._id && prev?.col === "SampleFiles"
                                        ? null
                                        : { rowId: project._id, feedId: feed?._id, col: "SampleFiles" }
                                    )
                                  }
                                  className="text-blue-600 underline px-2 py-1 rounded hover:bg-gray-100"
                                >
                                  View Files
                                </button>
                                {openDropdown?.rowId === project._id &&
                                  openDropdown?.feedId === feed?._id &&
                                  openDropdown?.col === "SampleFiles" && (
                                    <div className="absolute left-0 mt-1 min-w-[180px] max-h-52 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg p-2 z-50">
                                      <ul className="p-0 m-0 list-none">
                                        {project.SampleFiles.map((file, fileIdx) => (
                                          <li key={fileIdx} className="mb-1 last:mb-0">
                                            <a
                                              href={file}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              download
                                              className="block text-blue-600 hover:text-blue-800 hover:underline truncate"
                                              title={file}
                                            >
                                              View File
                                            </a>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>

                          {/* Framework Type */}
                          <td className="px-3 py-2">{feed.FrameworkType ?? "-"}</td>

                          {/* QA Report Count */}
                          <td className="px-3 py-2">{project.QAReportCount ?? "-"}</td>

                          {/* Manage By */}
                          <td className="px-3 py-2">{project.ManageBy ?? "-"}</td>

                          {/* QA Rules */}
                          <td className="px-3 py-2">{project.QARules ?? "-"}</td>

                          {/* DB Status */}
                          <td className="px-3 py-2">{project.DBStatus ?? "-"}</td>

                          {/* DB Type */}
                          <td className="px-3 py-2">{project.DBType ?? "-"}</td>

                          {/* Created Date */}
                          <td className="px-3 py-2">{project.CreatedDate ? new Date(project.CreatedDate).toLocaleDateString() : "-"}</td>

                          {/* Project Created By */}
                          <td className="px-3 py-2">{project.CreatedBy?.name ?? "-"}</td>

                          {/* Actions */}
                          {/* <td className="px-3 py-2">
                            <button>
                              <span className="text-blue-600 cursor-pointer hover:underline">Assign Feed to QA</span>
                            </button>
                          </td> */}
                        </tr>
                      ))
                      : (
                        // No feeds: show one row with project data
                        <tr key={project._id} className="bg-gray-50">
                          <td className="px-3 py-2">{idx + 1}</td> {/* No */}
                          <td className="px-3 py-2">
                            {project.ProjectCode || project.ProjectName
                              ? `[${project.ProjectCode ?? "-"}] ${project.ProjectName ?? "-"}`
                              : "-"}
                          </td> {/* Project Name */}

                          <td className="px-3 py-2">-</td> {/* Feed Name */}
                          {/* <td className="px-3 py-2">-</td>  */}
                          <td className="px-3 py-2">{project.Frequency ?? "-"}</td> {/* Frequency */}
                          <td className="px-3 py-2">-</td> {/* Platform */}
                          <td className="px-3 py-2">-</td> {/* Status */}
                          <td className="px-3 py-2">-</td> {/* BAU */}
                          <td className="px-3 py-2">-</td> {/* POC */}
                          <td className="px-3 py-2">{project.PMId?.name ?? "-"}</td> {/* PM */}
                          <td className="px-3 py-2">-</td> {/* PC */}
                          <td className="px-3 py-2">-</td> {/* TL */}
                          <td className="px-3 py-2">-</td> {/* Developer */}
                          <td className="px-3 py-2">-</td> {/* QA */}
                          <td className="px-3 py-2">-</td> {/* BAU Person */}
                          {/* <td className="px-3 py-2">{project.SOWFile?.length ? `${project.SOWFile.length} Files` : "-"}</td>  */}
                          <td className="px-3 py-2">
                            {project.SOWFile && project.SOWFile.length > 0 ? (
                              <div className="inline-block relative">
                                <button
                                  onClick={() =>
                                    setOpenDropdown(prev =>
                                      prev?.rowIdx === idx && prev?.col === "SOWFile" ? null : { rowIdx: idx, col: "SOWFile" }
                                    )
                                  }
                                  className="text-blue-600 underline px-2 py-1 rounded hover:bg-gray-100"
                                >
                                  {project.SOWFile.length === 1 ? "View File" : `${project.SOWFile.length} Versions`}
                                </button>
                                {openDropdown?.rowIdx === idx && openDropdown?.col === "SOWFile" && (
                                  <div className="absolute left-0 mt-1 min-w-[180px] max-h-52 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg p-2 z-50">
                                    <ul className="p-0 m-0 list-none">
                                      {project.SOWFile.map((file, fileIdx) => (
                                        <li key={fileIdx} className="mb-1 last:mb-0">
                                          <a
                                            href={file}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className="block text-blue-600 hover:text-blue-800 hover:underline truncate"
                                            title={file}
                                          >
                                            Version {fileIdx + 1}
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          {/* <td className="px-3 py-2">{project.SampleFiles?.length ? `${project.SampleFiles.length} Files` : "-"}</td>  */}
                          <td className="px-3 py-2 relative">
                            {project.SampleFiles && project.SampleFiles.length > 0 ? (
                              <div className="inline-block relative">
                                <button
                                  onClick={() =>
                                    setOpenDropdown(prev =>
                                      prev?.rowIdx === idx && prev?.col === "SampleFiles" ? null : { rowIdx: idx, col: "SampleFiles" }
                                    )
                                  }
                                  className="text-blue-600 underline px-2 py-1 rounded hover:bg-gray-100"
                                >
                                  View Files
                                </button>
                                {openDropdown?.rowIdx === idx && openDropdown?.col === "SampleFiles" && (
                                  <div className="absolute left-0 mt-1 min-w-[180px] max-h-52 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg p-2 z-50">
                                    <ul className="p-0 m-0 list-none">
                                      {project.SampleFiles.map((file, fileIdx) => (
                                        <li key={fileIdx} className="mb-1 last:mb-0">
                                          <a
                                            href={file}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className="block text-blue-600 hover:text-blue-800 hover:underline truncate"
                                            title={file}
                                          >
                                            View File
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-3 py-2">-</td> {/* Framework type */}
                          <td className="px-3 py-2">{project.QAReportCount ?? "-"}</td> {/* QA Report Count */}
                          <td className="px-3 py-2">{project.ManageBy ?? "-"}</td> {/* Manage By */}
                          <td className="px-3 py-2">{project.QARules ?? "-"}</td> {/* QA Rules */}
                          <td className="px-3 py-2">{project.DBStatus ?? "-"}</td> {/* DB Status */}
                          <td className="px-3 py-2">{project.DBType ?? "-"}</td> {/* DB Type */}
                          <td className="px-3 py-2">{project.CreatedDate ? new Date(project.CreatedDate).toLocaleDateString() : "-"}</td> {/* Created Date */}
                          <td className="px-3 py-2">{project.CreatedBy?.name ?? "-"}</td> {/* Project Created By */}
                          {/* <td className="px-3 py-2">
                            <button>
                              <span className="text-blue-600 cursor-pointer hover:underline">Assign Feed to QA</span>
                            </button>
                          </td> */}
                        </tr>

                      )
                  )
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center p-8 text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <img src={Img} alt="No data" className="w-32 h-32 object-contain opacity-80" />
                        <p className="font-semibold text-lg text-gray-600">No Data Found</p>
                        <p className="text-sm text-gray-400">Try adding new feeds to see them here.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

          </div>
        )}

        {user?.roleName === "Team Lead" && (

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200 ">
              <thead className="bg-gray-100 text-gray-700 sticky top-0">
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
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center p-8 text-gray-500">
                      <div className="flex justify-center items-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : data.length > 0 ? (
                  data.map((project, idx) =>
                    project.Feeds && project.Feeds.length > 0 ? (
                      project.Feeds.map((feed, feedIdx) => (
                        <tr
                          key={`${project._id}-${feed._id}`}
                          className={feedIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          {/* No */}
                          <td className="px-3 py-2">{feedCounter++}</td>

                          {/* Project Name */}
                          <td className="px-3 py-2">
                            {project.ProjectCode && project.ProjectName
                              ? `[${project.ProjectCode}] ${project.ProjectName}`
                              : "-"}
                          </td>

                          {/* Feed Name */}
                          <td
                            className="px-3 py-2 text-blue-600 cursor-pointer hover:underline"
                            onClick={() => (window.location.href = `/feed/${feed._id}`)}
                          >
                            {feed.FeedName ?? "-"}
                          </td>

                          {/* Feed ID */}
                          <td className="px-3 py-2">{feed.FeedId ?? "-"}</td>

                          {/* Frequency */}
                          <td className="px-3 py-2">{project.Frequency ?? "-"}</td>

                          {/* Platform / Domain | Application | Country */}
                          <td className="px-3 py-2">
                            {feed.DomainName && feed.ApplicationType && feed.CountryName
                              ? `${feed.DomainName}|${feed.ApplicationType}|${feed.CountryName}`
                              : "-"}
                          </td>

                          {/* Status */}
                          <td className="px-3 py-2">{feed.Status ?? "-"}</td>

                          {/* BAU */}
                          <td className="px-3 py-2">{feed.BAU ?? "-"}</td>

                          {/* POC */}
                          <td className="px-3 py-2">{feed.POC ?? "-"}</td>

                          {/* PM */}
                          <td className="px-3 py-2">{project.PMId?.name ?? "-"}</td>

                          {/* PC */}
                          <td className="px-3 py-2">{feed.PC ?? "-"}</td>

                          {/* TL */}
                          <td className="px-3 py-2">{feed.TLId?.name ?? "-"}</td>

                          {/* Developer */}
                          <td className="px-3 py-2">
                            {feed.DeveloperIds?.length
                              ? feed.DeveloperIds.map(dev => dev?.name ?? dev._id ?? dev).join(", ")
                              : "-"}
                          </td>

                          {/* QA */}
                          <td className="px-3 py-2">{feed.QAId?.name ?? "-"}</td>

                          {/* BAU Person */}
                          <td className="px-3 py-2">{feed.BAUPersonId?.name ?? "-"}</td>



                          {/* Framework Type */}
                          <td className="px-3 py-2">{feed.FrameworkType ?? "-"}</td>

                          {/* QA Report Count */}
                          <td className="px-3 py-2">{project.QAReportCount ?? "-"}</td>

                          {/* Manage By */}
                          <td className="px-3 py-2">{project.ManageBy ?? "-"}</td>

                          {/* QA Rules */}
                          <td className="px-3 py-2">{project.QARules ?? "-"}</td>

                          {/* DB Status */}
                          <td className="px-3 py-2">{project.DBStatus ?? "-"}</td>

                          {/* DB Type */}
                          <td className="px-3 py-2">{project.DBType ?? "-"}</td>

                          {/* Created Date */}
                          <td className="px-3 py-2">{project.CreatedDate ? new Date(project.CreatedDate).toLocaleDateString() : "-"}</td>

                          {/* Created By */}
                          <td className="px-3 py-2">{project.CreatedBy?.name ?? "-"}</td>

                          {/* Actions */}
                          <td className="px-3 py-2">
                            <button>
                              <span className="text-blue-600 cursor-pointer hover:underline">
                                Assign Feed to QA
                              </span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      // No feeds
                      <tr key={project._id}>
                        <td className="px-3 py-2">{idx + 1}</td>
                        <td className="px-3 py-2">{project.ProjectName ?? "-"}</td>
                        <td className="px-3 py-2" colSpan={columns.length - 2}>
                          No feeds
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center p-8 text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <img src={Img} alt="No data" className="w-32 h-32 object-contain opacity-80" />
                        <p className="font-semibold text-lg text-gray-600">No Data Found</p>
                        <p className="text-sm text-gray-400">Try adding new feeds to see them here.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>


            </table>
          </div>
        )}

        {user?.department !== "Sales" && user?.roleName !== "Manager" && user?.roleName !== "Team Lead" && (

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
                            navigate(`/project/feed`);
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
