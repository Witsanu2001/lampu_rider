import { Route } from "react-router-dom";
import StovesPage from "./StovesPage";

export const stoveRoutes = () => (
  <Route key="stove" path="/" element={<StovesPage />} />
);
