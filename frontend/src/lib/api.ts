export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function fetcher(url: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    
    // Handle DRF standard error formats
    let errorMessage = "An error occurred";
    if (error.detail) {
      errorMessage = error.detail;
    } else {
      // Try to get first field error
      const keys = Object.keys(error);
      if (keys.length > 0) {
        const firstError = error[keys[0]];
        if (Array.isArray(firstError)) {
          errorMessage = `${keys[0]}: ${firstError[0]}`;
        } else if (typeof firstError === 'string') {
          errorMessage = `${keys[0]}: ${firstError}`;
        }
      }
    }
    throw new Error(errorMessage);
  }

  if (res.status === 204) return null;
  return res.json();
}
