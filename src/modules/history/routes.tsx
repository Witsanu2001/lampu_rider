import { Route } from "react-router-dom";
import HistoryPage from "./HistoryPage";

export const HistoryRoutes = () => (
  <Route key="jobs" path="/" element={<HistoryPage />} />
);
