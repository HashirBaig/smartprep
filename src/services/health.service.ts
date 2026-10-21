import api from "@/lib/axios";
import type { HealthCheckResponse } from "@/types/api";

export const healthService = {
  check: async (): Promise<HealthCheckResponse> => {
    const { data } = await api.get<HealthCheckResponse>("/health");

    return data;
  },
};
