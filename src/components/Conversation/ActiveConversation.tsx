import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import ConversationPill from "./ConversationPill";
import NewConversation from "./NewConversation";
import { useParams } from "react-router-dom";
import { updateConversationInput, updateConversation, updateTemperature, updateMaxTokens } from "../../redux/conversationSlice";
import MessageList from "./MessageList";
import { connectWebSocket, disconnectWebSocket } from "../../redux/aynscThunks/websocket";
import { Card } from "../ui/card";
import EmptyConversation from "./EmptyConversation";
import { getFromLocalStorage, STORAGE_KEYS } from "../../utils/localStorage";
import { MODEL_CONFIG } from "../../config/modelConfig";

const ActiveConversation: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const activeConversation = useSelector((state: RootState) => state.conversation?.activeConversation);
  const conversationHistory = useSelector((state: RootState) => state.conversation?.activeConversationMessages || []);

  const { id } = useParams<{ id: string }>();
  const conversations = useSelector((state: RootState) => state.conversation?.conversations || []);
  const token = localStorage.getItem("token");
  const isConnected = useSelector((state: RootState) => state.websocket.isConnected);


  useEffect(() => {
    if (id) {
      const conversation = conversations.find((conversation) => conversation.conversationId === id);
      if (!activeConversation && conversation) {
        dispatch(updateConversation(conversation));

        const savedTemperature = getFromLocalStorage(
          STORAGE_KEYS.TEMPERATURE,
          MODEL_CONFIG.temperature,
          conversation.conversationId
        );
        const savedMaxTokens = getFromLocalStorage(
          STORAGE_KEYS.MAX_TOKENS,
          MODEL_CONFIG.maxTokens,
          conversation.conversationId
        );

        dispatch(updateTemperature(savedTemperature));
        dispatch(updateMaxTokens(savedMaxTokens));
      }
    } else {
      dispatch(updateConversation(null));


      dispatch(updateTemperature(MODEL_CONFIG.temperature));
      dispatch(updateMaxTokens(MODEL_CONFIG.maxTokens));
    }
  }, [id, conversations, dispatch]);

  useEffect(() => {
    const handleWebSocketConnection = async () => {
      if (isConnected) {
        dispatch(updateConversationInput(""));
        await dispatch(disconnectWebSocket());
      }

      if (token && activeConversation) {
        try {
          await dispatch(connectWebSocket({
            conversationId: activeConversation.conversationId,
            jwtKey: token || ""
          }));
        } catch (error) {
          console.error("WebSocket connection failed:", error);
        }
      }
    };

    handleWebSocketConnection();
  }, [activeConversation?.conversationId, dispatch]);

  return (
    <Card className="flex flex-col flex-2 w-full h-[90vh] justify-end border border-pink-50 rounded-none rounded-tl-[3.25rem] p-5">
      <div className={`flex flex-col justify-between h-full`}>
        {!activeConversation && <NewConversation />}
        {activeConversation && conversationHistory.length === 0 && <EmptyConversation />}
        {activeConversation && conversationHistory.length > 0 && <MessageList />}
        <ConversationPill />
      </div>
    </Card>
  );
};

export default ActiveConversation;
