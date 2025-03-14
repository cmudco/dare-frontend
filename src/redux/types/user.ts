export interface UserStats {
    promptCount: number;      
    fileCount: number;         
    conversationCount: number;
    messageCount: number;     
    aiMessageCount: number;
    taggedFilesCount: number;
}

export interface User {
    id: number;
    email: string;
    username: string | null;
    name: string;
    role: string;
    is_2fa_enabled: boolean;
    is_2fa_pending: boolean;
    is_active: boolean;
    is_staff: boolean;
    roomid?: string;
    invite_code?: string;
    profile_picture?: string;
}

export interface UserState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    temp_token: string;
    token: string;
    userLoading: boolean;
    successMessage: string | null;
    stats: UserStats | null;
}
