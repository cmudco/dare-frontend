export interface MyFile {
  id: number;
  file: string;
  file_name: string;
  file_size: string;
  uploaded_at: string;
  directory: string;
  tags: string[];
}

export interface FileState {
  files: MyFile[];
  loading: boolean;
  error: string | null;
  selectedTags: string[];
  selectedFiles: File | null;
  isModalOpen: boolean;
  filename: string;
}
