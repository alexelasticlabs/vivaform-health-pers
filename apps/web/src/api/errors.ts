import type { AxiosError } from "axios";

export type ApiErrorPayload = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};

export const extractErrorMessage = (error: unknown): string => {
  if ((error as AxiosError)?.isAxiosError) {
    const axiosError = error as AxiosError<ApiErrorPayload>;
    const payload = axiosError.response?.data;

    if (payload) {
      if (Array.isArray(payload.message)) {
        return payload.message.join("\n");
      }

      if (payload.message) {
        return payload.message;
      }

      if (payload.error) {
        return payload.error;
      }
    }

    return axiosError.message;
  }

  return (error as Error)?.message ?? "An unexpected error occurred";
};