import { Prompt } from "./prompt";

export enum WorkflowMode {
    Serial = 1,
    Parallel = 2,
}

export interface Step {
    id: string;
    workflow: string;
    prompt: string;
    prompt_detail?: Prompt;
    order: number;
    created_at?: string;
    createdAt?: string;
}

export interface Workflow {
    id: string;
    title: string;
    description: string;
    mode: WorkflowMode;
    createdAt?: string; 
    created_at?: string;
    user: string;
    steps?: Step[];
    stepsDetail?: Step[];
}

export interface WorkflowState {
    workflows: Workflow[];
    selectedWorkflow: Workflow | null;
    loading: boolean;
    error: string | null;
    isModalOpen: boolean;
}

export interface WorkflowTableProps {
    searchQuery: string;
}
