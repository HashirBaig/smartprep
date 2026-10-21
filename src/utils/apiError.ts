import axios from "axios";
import type { ApiErrorResponse } from "@/types/api";

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const serverMessage = error.response?.data?.error;

    if (serverMessage) {
      return serverMessage;
    }

    if (error.code === "ECONNABORTED") {
      return "The request timed out. Please try again.";
    }

    if (error.code === "ERR_NETWORK") {
      return "Cannot connect to the server. Check your connection.";
    }

    switch (error.response?.status) {
      case 400:
        return "Invalid request. Please check your input.";

      case 401:
        return "You are not authorized to perform this action.";

      case 403:
        return "You do not have permission for this action.";

      case 404:
        return "The requested resource was not found.";

      case 409:
        return "The request conflicts with the current data.";

      case 500:
        return "An internal server error occurred.";

      default:
        return error.message || "Request failed.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}
