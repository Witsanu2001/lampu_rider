import { Route } from "react-router-dom";
import HistoryPage from "./HistoryPage";

export const historyRoutes = () => (
  <Route key="history" path="/history" element={<HistoryPage />} />
);
