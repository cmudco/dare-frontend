import { FileState } from "../types/files";

export const initialState: FileState = {
  files: [],
  loading: false,
  error: null,
  selectedTags: [],
  isModalOpen: false,
  filename: "",
  jobStatuses: {},
  pollingLoading: false,
};