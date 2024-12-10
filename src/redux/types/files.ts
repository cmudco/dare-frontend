export interface MyFile {
  id: number;
  file: string;
  file_size: string;
  uploaded_at: string;
  tags: string[];
}

export interface FileState {
  files: MyFile[];
  loading: boolean;
  error: string | null;
  selectedTags: string[];
  selectedFile: File | null;
  isModalOpen: boolean;
  filename: string;
}
