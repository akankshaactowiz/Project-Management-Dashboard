import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

import Dashboard from "../page/Home.jsx";
import Project from "../page/Projects.jsx";
import FeedPage from "../page/Feed.jsx";
import Escalations from "../page/Escalations.jsx";
import QA from "../page/QA.jsx";
import Tasks from "../page/Tasks.jsx";
import Work from "../page/Work.jsx";
import Support from "../page/Support.jsx";
import Profile from "../page/Profile.jsx";
import Users from "../page/UserList.jsx";
import Permissions from "../page/EditPermissionsPage.jsx";
import Setting from "../page/Setting.jsx";
import Report from "../page/Reports.jsx";
import Layout from "../page/Layout.jsx";
import AuthPage from "../page/AuthPage.jsx";
import ProjectDetails from "../page/UserProjectsDetail.jsx";
import ReportDetail from "../page/ReportDetails.jsx";
import FeedDetails from "../page/FeedDetails.jsx";
import FeedUpdate from "../page/FeedUpdatePage.jsx";
import NotFound from "../page/NotFoundPage.jsx";
import QAReportDetails from "../page/QAReportDetail.jsx"
import DeveloperView from "../page/DeveloperReport.jsx"
import ProjectInfo from "../page/ProjectDetails.jsx";
import ProjectFilesPage from "../page/DocumentMaterialPage.jsx";
function AppRoutes() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<AuthPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/home" element={<Dashboard />} />
          <Route path="/project" element={<ProtectedRoute requiredModule="Project" requiredAction="view"><Project /></ProtectedRoute>} />
          {/* <Route path="/project/:id" element={<ProtectedRoute requiredModule="Project" requiredAction="view"><ProjectInfo /></ProtectedRoute>} ></Route> */}
          {/* <Route path="/project/:id/details" element={<ProtectedRoute requiredModule="Project" requiredAction="update"><ProjectInfo /></ProtectedRoute>} key="project-update"></Route> */}
          {/* <Route path="/project/feed" element={
            <FeedPage />} /> */}
          <Route path="/project/:id/files" element={<ProjectFilesPage />} />

          <Route path="/project/feed/:id" element={<ProtectedRoute requiredModule="Feed" requiredAction="update"><FeedDetails /></ProtectedRoute>} key="feed"></Route>
          <Route path="/project/feed/:id/update" element={<ProtectedRoute requiredModule="Feed" requiredAction="update"><FeedUpdate /></ProtectedRoute>} key="feed-update"></Route>
          <Route path="/escalation" element={<ProtectedRoute requiredModule="Escalation" requiredAction="view"><Escalations /></ProtectedRoute>} />
          <Route path="/qa" element={<ProtectedRoute requiredModule="QA" requiredAction="view"><QA /></ProtectedRoute>} />
           <Route path="/qa/:id" element={<QAReportDetails />} />
            {/* <Route path="/developer/report/:uniqueId" element={<DeveloperView />} /> */}
          <Route path="/tasks" element={<ProtectedRoute requiredModule="Tasks" requiredAction="view"><Tasks /></ProtectedRoute>} />
          <Route path="/work" element={<ProtectedRoute requiredModule="Work" requiredAction="view"><Work /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute requiredModule="Support" requiredAction="view"><Support /></ProtectedRoute>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/users" element={<ProtectedRoute requiredModule="Users" requiredAction="view"><Users /></ProtectedRoute>} />
          <Route path="/users/:userId" element={<ProtectedRoute requiredModule="Users" requiredAction="update"><Permissions /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute requiredModule="Settings" requiredAction="view"><Setting /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute requiredModule="Reports" requiredAction="view"><Report /></ProtectedRoute>} />
          <Route path="/users/:id/details" element={<ProtectedRoute requiredModule="Users" requiredAction="view"><ProjectDetails /></ProtectedRoute>} />
          <Route path="/users/:id/reports" element={<ProtectedRoute requiredModule="Reports" requiredAction="view"><Report /></ProtectedRoute>} />
          <Route path="/users/:id/report" element={<ProtectedRoute requiredModule="Reports" requiredAction="view"><ReportDetail /></ProtectedRoute>} />
        </Route>
      </Route>

   

      {/* Fallback route */}
      {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
