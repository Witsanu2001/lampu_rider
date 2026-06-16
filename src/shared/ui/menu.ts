// src/shared/ui/menu.ts

import Delivery from "../../assets/delivery.png";
import History from "../../assets/history.png";
import Stove from "../../assets/stove.png";

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
    iconUrl: Delivery,
  },
  {
    label: "ประวัติ",
    to: "/history",
    roles: ["rider"],
    iconUrl: History,
  },
  {
    label: "เก็บเตา",
    to: "/stove",
    roles: ["rider"],
    iconUrl: Stove,
  }
];