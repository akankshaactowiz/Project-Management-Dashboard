import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaFilePdf, FaFileCsv } from "react-icons/fa6";
import { RiFileExcel2Fill } from "react-icons/ri";
import { LuFileJson } from "react-icons/lu";
import { FaEdit } from "react-icons/fa";

import Breadcrumb from "../components/Breadcrumb";
import Pagination from "../components/Pagination";
import Img from "../assets/no-data-found.svg";
import { exportData } from "../utils/exportUtils";

export default function FeedDetails() {
  const { id } = useParams();
  const [feed, setFeed] = useState(null);
  const [activeTab, setActiveTab] = useState("Feed Log");
  const [entries, setEntries] = useState(25);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dataRows, setDataRows] = useState([]);
  // const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const tabs = ["Feed Log", "Auto QA Rules", "Last Approved Sample File"];
  const navigate = useNavigate();

  // Fetch feed details
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/feed/${id}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();

        // Handle non-breaking space key
        const feedKey = Object.keys(data).find(
          (k) => k.replace(/\s/g, "").toLowerCase() === "feedname"
        );
        const projectKey = Object.keys(data).find(
          (k) => k.replace(/\s/g, "").toLowerCase() === "projectname"
        );

        setFeed({
          ...data,
          feedName: data[feedKey],
          projectName: data[projectKey],
        });
      } catch (err) {
        console.error("Error fetching feed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, [id]);


  const columns = [
    "Timestamp",
    "Status",
    "Message",
    "Processed Records",
    "Failed Records",
    "Duration",
    "Executed By",
  ];
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* <div className="flex bg-gray-50 items-center justify-end px-2">
        <Breadcrumb feedName={feed?.feedName} />
        <button
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded cursor-pointer"
          onClick={() => navigate(`/feed/${id}/update`)}
        >
          <FaEdit size={18} />
          <span>Edit</span>
        </button>
      </div> */}

      {/* Top summary card */}

      {loading ? (
        <>
          <div className="flex justify-center items-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-blue-600 motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          </div>
        </>
      ) : (
        feed && (
          <div className="bg-white rounded-lg shadow p-6 mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="bg-purple-200 text-purple-700 px-3 py-2 rounded-md text-md font-semibold">
                {feed?.projectName || "Feed Details"}
              </h3>
              <button
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded cursor-pointer"
                onClick={() => navigate(`/project/feed/${id}/update`)}
              >
                <FaEdit size={18} />
                <span>Edit</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Feed Name:</p>
                <p className="font-semibold">{feed.FeedName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Feed Id:</p>
                <p className="font-semibold">{feed["FeedId"]}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Platform:</p>
                <p className="font-semibold">{feed.Platform}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">PM:</p>
                <p className="font-semibold">{feed.PM}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Developer:</p>
                <p className="font-semibold">{feed.Developer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">BAU:</p>
                <p className="font-semibold">{feed.BAU}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">QA:</p>
                <p className="font-semibold">{feed.QA}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rules Status:</p>
                <p className="font-semibold">{feed["Rules Status"]}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rules Apply On:</p>
                <p className="font-semibold">{feed["Rules Apply"]}</p>
              </div>
            </div>
          </div>
        )
      )}

      {/* Tabs */}
      <div className="mt-6 border-b border-gray-300">
        <div className="flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
                setSearch("");
              }}
              className={`py-2 font-medium ${activeTab === tab
                  ? "border-b-2 border-purple-600 text-purple-700"
                  : "text-gray-600"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white">
        {/* Table controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between m-4 gap-3">
          {/* Left: Show entries */}
          <div className="flex items-center space-x-2">
            <label htmlFor="entries" className="text-gray-700">
              Show
            </label>
            <select
              id="entries"
              value={entries}
              onChange={(e) => {
                setEntries(Number(e.target.value));
                setCurrentPage(1); // reset to first page
              }}
              className="border rounded px-2 py-1"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className=" text-gray-700">entries</span>
          </div>

          {/* Right: Search + Export */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1); // reset to first page
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

            {/* Export icons */}
            <button
              title="PDF"
              className="text-gray-600 hover:text-gray-900"
              onClick={() => exportData("pdf", "feed-data")}
            >
              <FaFilePdf size={16} className="text-red-700" />
            </button>
            <button
              title="Excel"
              className="text-green-600 hover:text-green-800"
              onClick={() => exportData("excel", "feed-data")}
            >
              <RiFileExcel2Fill size={16} className="text-green-600" />
            </button>
            <button
              title="CSV"
              className="text-blue-600 hover:text-blue-800"
              onClick={() => exportData("csv", "feed-data")}
            >
              <FaFileCsv size={16} className="text-blue-600" />
            </button>
            <button
              title="JSON"
              className="text-red-600 hover:text-red-800"
              onClick={() => exportData("json", "feed-data")}
            >
              <LuFileJson size={16} className="text-yellow-500" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto ">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2 text-left font-semibold whitespace-nowrap"
                  >
                    {col.replace(/\./g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.length > 0 ? (
                dataRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {columns.map((col) => (
                      <td
                        key={col}
                        className="px-3 py-2 whitespace-nowrap text-sm"
                      >
                        {row[col] ?? "-"}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center p-8 text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={Img}
                        alt="No data"
                        className="w-32 h-32 opacity-80"
                      />
                      <p>No Data Found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
