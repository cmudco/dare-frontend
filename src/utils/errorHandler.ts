import { AxiosError, isAxiosError } from "axios";

type ErrorResponse = {
  error: string;
};

export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    return (
      (error as AxiosError<ErrorResponse>).response?.data?.error ||
      "An unexpected error occurred"
    );
  }
  return "An unexpected error occurred";
};
