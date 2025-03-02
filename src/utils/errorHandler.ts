import { AxiosError, isAxiosError } from "axios";

type ErrorResponse = {
    error?: string;
    nonFieldErrors?: string[];
    [key: string]: string[] | string | undefined;
};

export const getErrorMessage = (error: unknown): string => {
    if (isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        if (axiosError.response?.data) {
            const errorData = axiosError.response.data;

            if (errorData.error) {
                return errorData.error;
            }

            if (
                errorData.nonFieldErrors &&
                errorData.nonFieldErrors.length > 0
            ) {
                return errorData.nonFieldErrors.join(". ");
            }

            for (const key in errorData) {
                if (Array.isArray(errorData[key])) {
                    const errorArray = errorData[key] as string[];
                    if (errorArray.length > 0) {
                        return errorArray.join(". ");
                    }
                }
            }
        }
        return "An unexpected error occurred";
    }
    return "An unexpected error occurred";
};
