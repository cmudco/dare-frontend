export interface WebSocketState {
    isConnected: boolean;
    error: string | null;
}

export interface WebSocketMessage {
    message?: string;
    sender?: string;
    sender_type?: number;
    timestamp?: string;
    files?: Array<{ id: number; name: string; url: string }>;
    history?: Array<WebSocketMessage>;
    title?: string;
    partial_response?: string;
    error?: string;
}
