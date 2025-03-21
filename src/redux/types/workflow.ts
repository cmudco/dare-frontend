// redux/types/workflow.ts
import { Prompt } from "./prompt";

export enum WorkflowMode {
  Serial = 1,
  Parallel = 2,
}

export interface Step {
  id?: string; // Optional for new steps
  workflow?: string;
  prompt: Prompt | null; // Allow null for unsaved steps
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
  savedStepIds: string[];
  tempSteps: Step[];
}

export interface WorkflowTableProps {
  searchQuery: string;
}