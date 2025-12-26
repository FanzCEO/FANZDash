import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Get auth token from localStorage
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

// Get CSRF token from cookies
export function getCsrfToken(): string | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === '_csrf' || name === 'XSRF-TOKEN') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

// Add auth and CSRF headers
export function getAuthHeaders(headers: Record<string, string> = {}): Record<string, string> {
  const authToken = getAuthToken();
  const csrfToken = getCsrfToken();

  const result = { ...headers };

  if (authToken) {
    result['Authorization'] = `Bearer ${authToken}`;
  }
  if (csrfToken) {
    result['CSRF-Token'] = csrfToken;
    result['X-CSRF-Token'] = csrfToken;
  }

  return result;
}

// Add CSRF token to request headers
export function addCsrfHeaders(headers: Record<string, string> = {}): Record<string, string> {
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    return {
      ...headers,
      'CSRF-Token': csrfToken,
      'X-CSRF-Token': csrfToken,
    };
  }
  return headers;
}

export async function apiRequest(
  url: string,
  method: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Start with auth headers (includes Authorization token + CSRF)
  const headers: Record<string, string> = getAuthHeaders({
    ...(data ? { "Content-Type": "application/json" } : {}),
  });

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
