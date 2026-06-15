import { auth } from "../../const/firebase";

export async function getFreshToken(): Promise<string> {
  const user = auth.currentUser;
  
  if (user) {
    return await user.getIdToken(true); 
  }

  console.error("Session expired, redirecting to login...");
  window.location.href = "/login";
  return "";
}