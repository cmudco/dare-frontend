export const TABLE_HEAD = ["File Name", "File Type", "Size", "Tags", "Action"];

export const TAG_COLORS: {
    [key: string]: "yellow" | "red" | "blue" | "green" | "purple" | "gray";
} = {
    Archived: "blue",
    Favorite: "green",
    Personal: "yellow",
    GenAI: "blue",
    Review: "green",
    Research: "yellow",
    Important: "red",
    AutoCorrecting: "purple",
    MachineLearning: "gray",
    Steps: "green",
    Work: "purple",

};

export const MAX_FILE_SIZE = 15 * 1024 * 1024;