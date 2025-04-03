"use client";

import { chatDB } from "../localDb";

export function logOut() {
  try {
    chatDB.clearAllData();
    localStorage.clear();
    window.location.href = "/auth/logout";
  } catch (error) {
    console.error("Error cleaning up local data before logout:", error);
  }
  // logout from Auth0
}
