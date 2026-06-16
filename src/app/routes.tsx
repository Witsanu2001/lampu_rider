import { Routes } from "react-router-dom";
import { JobsRoutes } from "../modules/Job/routes";
import { historyRoutes } from "../modules/history/routes";
import { stoveRoutes } from "../modules/Stove/routes";


export const AppRoutes = () => {
    return (
    <Routes>
      {JobsRoutes()}
      {historyRoutes()}
      {stoveRoutes()}
    </Routes>
  );
}