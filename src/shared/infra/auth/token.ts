/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../../const/firebase"

const TOKEN_KEY = 'auth_token'
const TOKEN_EXPIRY_KEY = 'auth_token_expiry'

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token: string, expiresInHours: number = 24): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
  const expiryTime = Date.now() + expiresInHours * 60 * 60 * 1000
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())
}

export const isTokenExpired = (): boolean => {
  if (typeof window === 'undefined') return true
  const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY)
  if (!expiryTime) return true
  return Date.now() > parseInt(expiryTime)
}

export const removeToken = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_EXPIRY_KEY)
}

export const isAuthenticated = (): boolean => {
  const token = getToken()
  if (!token) {
    const userData = localStorage.getItem('userData')
    if (userData) {
      try {
        const parsed = JSON.parse(userData)
        return !!parsed.uid
      } catch (e) {
        return false
      }
    }
    return false
  }
  if (isTokenExpired()) {
    removeToken()
    return false
  }
  return true
}

export async function getFreshToken(): Promise<string> {
  console.log("🔑 getFreshToken called");
  
  const savedToken = getToken();
  if (savedToken && !isTokenExpired()) {
    console.log("✅ Using existing token from localStorage");
    return savedToken;
  }

  console.log("🔄 Token expired or not found, refreshing from Firebase...");
  
  const user = await new Promise<any>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      unsubscribe();
      resolve(currentUser);
    });
  });

  if (user) {
    try {
      const newToken = await user.getIdToken(true); 
      setToken(newToken, 24);
      console.log("✅ Token refreshed from Firebase");
      return newToken;
    } catch (error) {
      console.error("Error getting fresh token:", error);
    }
  }

  if (savedToken) {
    console.log("⚠️ Using saved token even though expired");
    return savedToken;
  }

  console.error("❌ Session expired or no token found.");
  return "";
}