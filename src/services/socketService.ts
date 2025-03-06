import { AppDispatch } from "../redux/store";
import { addMessage } from "../redux/chatSlice";

/**
 * Processes chat history from a WebSocket message.
 *
 * @param data The WebSocket message containing chat history.
 * @param dispatch The dispatch function from Redux to dispatch actions.
 */
// Add chat history to the Redux state
export const handleChatHistory = (history: any[], dispatch: AppDispatch) => {
    history.forEach((msg) => {
        dispatch(addMessage({
            id: msg.id,
            message: msg.message,
            sender_name: msg.sender || "Unknown",
            sender_type: msg.sender_type,
            isSender: msg.sender_type === 1, // Assuming 1 is sender
            date: msg.date,
            files: msg.files || [],
            streaming: false,
        }));
    });
};
