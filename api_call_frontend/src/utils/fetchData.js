import SearchInfo from "../models/SearchInfo";

export function apiCall() {
  const callApi = async (searchInfo) => {
    try {
      const response = await fetch(searchInfo.url, {
        method: SearchInfo.requestMethod,
        headers: searchInfo.headers,
        signal: searchInfo.signal // Add support for AbortController signal
      });

      if (!response.ok) {
        return {
          data: null,
          error: `HTTP Error: ${response.statusText} (${response.status})`,
        };
      }

      try {
        const result = await response.json();
        return { data: result, error: null };
      } catch {
        return { data: null, error: "Failed to parse JSON response." };
      }
    } catch (networkError) {
      // Don't report aborted requests as errors
      if (networkError.name === 'AbortError') {
        return { data: null, error: 'Request was cancelled' };
      }
      return { data: null, error: `Network Error: ${networkError.message}` };
    }
  };

  return { callApi };
}
