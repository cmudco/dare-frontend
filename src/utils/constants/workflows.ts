export const WORKFLOWS_TABLE_HEAD = [
    "Workflow Name",
    "Description",
    "Mode",
    "Steps",
    "Date Uploaded",
    "Action",
];

export const WORKFLOW_MODES = [
    {
        id: 1,
        name: "Sequential",
        description: "Execute steps one after another in sequence.",
    },
    {
        id: 2,
        name: "Parallel",
        description: "Execute all steps simultaneously in parallel.",
    },
];
