/* eslint-disable @typescript-eslint/no-explicit-any */
import { getFreshToken } from "../../shared/infra/auth/token";
const apiUrl = import.meta.env.VITE_API_URL;


export const getStove = async (page = 1, limit = 5) => {

    const token = await getFreshToken();

    const response = await fetch(`${apiUrl}/api/jobs/stove_rider?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch orders");
    }

    return json.data;
}

export async function updateStoveStatus(payload: {
  order_id: string;
  is_complete: boolean;
  collected_stoves: number;
  collected_pans: number;
  reason: string;
}): Promise<any> {
  const token = await getFreshToken();

  const response = await fetch(`${apiUrl}/api/jobs/stove_status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Failed to update stove status");
  }

  return json;
}