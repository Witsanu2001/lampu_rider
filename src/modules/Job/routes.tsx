import { Route } from "react-router-dom";
import JobsPage from "./JobsPage";
import JobsDetail from "./components/JobsDetail";

export const JobsRoutes = () => (
  <>
    <Route key="Jobs" path="/" element={<JobsPage />} />
    <Route key="JobsDetail" path="/job_detail/:id" element={<JobsDetail />} />
  </>
);
