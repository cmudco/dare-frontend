import { ALLOWED_FILE_TYPES, TAG_COLORS } from "./constants/file";

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export function getTagColor(
    tagName: string
): "yellow" | "red" | "blue" | "green" | "purple" | "gray" {
    if (TAG_COLORS[tagName]) {
        return TAG_COLORS[tagName];
    }

    const colors: Array<
        "yellow" | "red" | "blue" | "green" | "purple" | "gray"
    > = ["yellow", "red", "blue", "green", "purple"];

    const hash =
        tagName.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
        colors.length;

    return colors[hash];
}

export const getFileExtension = (filename: string): string => {
    return filename.split(".").pop()?.toLowerCase() || "";
};

export const isAllowedFileType = (file: File): boolean => {
    if (ALLOWED_FILE_TYPES.includes(file.type)) {
        return true;
    }

    const extension = getFileExtension(file.name);
    const allowedExtensions = ["docx", "doc", "pdf", "txt", "md", "json"];
    return allowedExtensions.includes(extension);
};
