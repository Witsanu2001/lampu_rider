import { Route } from "react-router-dom";
import JobsPage from "./JobsPage";

export const JobsRoutes = () => (
  <Route key="Jobs" path="/" element={<JobsPage />} />
);
