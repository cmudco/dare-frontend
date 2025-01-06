import { AppDispatch } from '../redux/store';
import { addMessage, updateMessage } from '../redux/chatSlice';

let partialBuffer = '';
let currentMessageId: string | null = null;

interface Message {
  user_message: string;
  bot_response: string;
}

interface Data {
  history?: Message[];
  title?: string;
  partial_response?: string;
  error?: string;
}

export const handleDataHistory = (data: Data, dispatch: AppDispatch) => {
  if (data.history) {
    data.history.forEach((msg: { user_message: string; bot_response: string }) => {
      const baseTimestamp = Date.now();

      if (msg.user_message?.trim()) {
        dispatch(addMessage({
          id: baseTimestamp.toString(),
          message: msg.user_message,
          isSender: true,
          date: new Date(baseTimestamp).toISOString(),
        }));
      }

      if (msg.bot_response?.trim()) {
        dispatch(addMessage({
          id: (baseTimestamp + 1).toString(),
          message: msg.bot_response,
          isSender: false,
          date: new Date(baseTimestamp + 1).toISOString(),
        }));
      }
    });
  }
};

export const handleDataConditions = (data: Data, dispatch: AppDispatch) => {
  const messageId = currentMessageId || Date.now().toString();

  if (data.title) {
    if (partialBuffer == '') {
      return;
    }
    dispatch(updateMessage({
      id: messageId,
      message: partialBuffer,
      isSender: false,
      date: new Date().toISOString(),
      streaming: false
    }));
    partialBuffer = '';
    currentMessageId = null;
    return;
  }

  currentMessageId = messageId;
  partialBuffer += data.partial_response;

  dispatch(updateMessage({
    id: messageId,
    message: partialBuffer,
    isSender: false,
    date: new Date().toISOString(),
    streaming: true
  }));
};

export const handleError = (data: Data, dispatch: AppDispatch) => {
  console.error('WebSocket error:', data.error);
  if (currentMessageId) {
    dispatch(updateMessage({
      id: currentMessageId,
      message: partialBuffer || "An error occurred while processing your request",
      isSender: false,
      date: new Date().toISOString(),
      streaming: false
    }));
  }
  partialBuffer = '';
  currentMessageId = null;
};