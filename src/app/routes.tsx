import { Routes } from "react-router-dom";
import { homeRoutes } from "../modules/home/routes";


export const AppRoutes = () => {
    return (
    <Routes>
      {homeRoutes()}
    </Routes>
  );
}