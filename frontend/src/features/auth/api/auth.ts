import { apiClient } from "@/api/apiClient";
import { LoginApiResponse, getCurrentResponse } from "@/types/global.types";
import { getCookie } from "../utils";

export function login(email: string, password: string) {
  return apiClient<LoginApiResponse>("/api/auth/login", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
}

export function register(email: string, password: string) {
  return apiClient<LoginApiResponse>("/api/auth/register", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return apiClient("/api/auth/logout", {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRF-Token": getCookie("csrf_token") ?? "",
    },
  });
}

export function getCurrentUser() {
  return apiClient<getCurrentResponse>("/api/auth/me", {
    method: "GET",
    credentials: "include",
  });
}
