import { AppDispatch } from '../redux/store';
import { addMessage, } from '../redux/chatSlice';

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
