import { Route } from "react-router-dom";
import HomePage from "./HomePage";

export const homeRoutes = () => (
  <Route key="home" path="/" element={<HomePage />} />
);
