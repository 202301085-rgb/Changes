// API configuration and functions
const BACKEND_URL = "http://localhost:8000";

// Interface for user data
export interface UserData {
  id: number;
  name: string;
  email_id: string;
}

// Interface for search history item
export interface SearchHistoryItem {
  query: string;
  timestamp: string;
  response_type?: string;
}

// Interface for recommendation response
export interface RecommendationResponse {
  recommendations: Array<{
    name: string;
    city: string;
    country: string;
    category: string;
    description: string;
    score: number;
  }>;
  based_on_searches: string[];
  summary: string;
}

// Interface for API response
export interface AIResponse {
  type: "itinerary" | "places" | "unsupported" | "general" | "error";
  country?: string;
  cities?: string[];
  days?: Array<{
    day: number;
    plan: string[];
  }>;
  location?: string;
  category?: string;
  places?: Array<{
    name: string;
    speciality: string;
    address: string;
  }>;
  message?: string;
  raw_error?: string;
}

/**
 * Get AI response from the backend API
 * @param prompt - The user's prompt/query
 * @returns Promise with AI response
 */
export async function getAIResponse(prompt: string): Promise<AIResponse> {
  const token = localStorage.getItem("access_token");
  
  if (!token) {
    throw new Error("Authentication required. Please log in.");
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/travel/generate?prompt=${encodeURIComponent(prompt)}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("access_token");
        throw new Error("Session expired. Please log in again.");
      } else if (response.status === 422) {
        throw new Error("Invalid request. Please check your prompt.");
      } else {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
    }

    const data: AIResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred while fetching AI response.");
    }
  }
}

/**
 * Get current user information from the backend API
 * @returns Promise with user data
 */
export async function getCurrentUser(): Promise<UserData> {
  const token = localStorage.getItem("access_token");
  
  if (!token) {
    throw new Error("Authentication required. Please log in.");
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/auth/me`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("access_token");
        throw new Error("Session expired. Please log in again.");
      } else {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
    }

    const data: UserData = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred while fetching user data.");
    }
  }
}

/**
 * Get personalized recommendations based on search history
 * @returns Promise with recommendation data
 */
export async function getPersonalizedRecommendations(topK: number = 10): Promise<RecommendationResponse> {
  const token = localStorage.getItem("access_token");
  
  if (!token) {
    throw new Error("Authentication required. Please log in.");
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/recommendations/personalized?top_k=${topK}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("access_token");
        throw new Error("Session expired. Please log in again.");
      } else {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
    }

    const data: RecommendationResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred while fetching recommendations.");
    }
  }
}

/**
 * Get user's search history
 * @returns Promise with search history
 */
export async function getSearchHistory(): Promise<SearchHistoryItem[]> {
  const token = localStorage.getItem("access_token");
  
  if (!token) {
    throw new Error("Authentication required. Please log in.");
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/recommendations/search-history`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("access_token");
        throw new Error("Session expired. Please log in again.");
      } else {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    return data.search_history || [];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred while fetching search history.");
    }
  }
}