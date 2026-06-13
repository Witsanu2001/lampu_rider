// src/shared/ui/menu.ts

import Home from "../../assets/home.png";
import Order from "../../assets/orderCheck.png";
import UserSetting from "../../assets/user-setting.png";

export interface MenuItem {
  label: string;
  to: string;
  iconUrl?: string;
  roles?: string[];
}

export const menuConfig: MenuItem[] = [
  {
    label: "หน้าแรก",
    to: "/",
    roles: ["rider"],
    iconUrl: Home,
  },
  {
    label: "ออเดอร์",
    to: "/jobs",
    roles: ["rider"],
    iconUrl: Order,
  },
  {
    label: "ประวัติ",
    to: "/history",
    roles: ["rider"],
    iconUrl: UserSetting,
  },
];