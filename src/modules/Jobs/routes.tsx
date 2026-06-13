import { Route } from "react-router-dom";
import JobsPage from "./JobsPage";

export const jobsRoutes = () => (
  <Route key="jobs" path="/" element={<JobsPage />} />
);
