import axios, { AxiosError } from "axios";

type ErrorResponse = {
    message?: string;
    nonFieldErrors?: string[];
    [key: string]: string[] | string | undefined;
};

export const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;

        if (axiosError.response?.data) {
            const errorData = axiosError.response.data;

            if (errorData.message) {
                return errorData.message;
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

        return axiosError.message || "An unexpected error occurred";
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "An unexpected error occurred";
};
