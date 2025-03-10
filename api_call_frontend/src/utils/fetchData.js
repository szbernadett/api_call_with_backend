import SearchInfo from "../models/SearchInfo";

export function apiCall() {
  const callApi = async (searchInfo) => {
    try {
      const response = await fetch(searchInfo.url, {
        method: SearchInfo.requestMethod,
        headers: searchInfo.headers,
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
      return { data: null, error: `Network Error: ${networkError.message}` };
    }
  };

  return { callApi };
}
