// src/lib/api-client.ts
import { apiUrl } from "@/config/constants";

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, headers, ...customConfig } = options;

  // 1. Build URL with query parameters automatically
  const url = new URL(
    endpoint.startsWith("http") ? endpoint : `${apiUrl}${endpoint}`,
  );

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  // 2. Default configuration with custom override support
  const config: RequestInit = {
    method: customConfig.body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      ...headers, // Override defaults if specific headers are needed
    },
    ...customConfig,
  };

  const response = await fetch(url.toString(), config);

  // 3. Centralized Error Handling
  if (!response.ok) {
    // You can parse custom error structures from your backend here if needed
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`,
    );
  }

  // 4. Return parsed response payload typed automatically
  return response.json() as Promise<T>;
}
