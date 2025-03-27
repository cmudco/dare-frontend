import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleDropdown,
  updateSelectedModel,
} from "../../redux/conversationSlice";
import { AppDispatch, RootState } from "../../redux/store";
import { getAvailableModels } from "../../redux/aynscThunks/conversation";
import { LLMModel } from "@/redux/types/conversation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

const ModelPicker: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const selectedModel = useSelector(
    (state: RootState) => state.conversation.selectedModel
  );
  const models = useSelector(
    (state: RootState) => state.conversation.availableModels
  );
  const loading = useSelector(
    (state: RootState) => state.conversation.loading
  );
  const error = useSelector((state: RootState) => state.conversation.error);

  useEffect(() => {
    dispatch(getAvailableModels());
  }, [dispatch]);

  const handleModelSelect = (llmId: number) => {
    dispatch(updateSelectedModel(llmId));
    dispatch(toggleDropdown());
  };

  const getModelButtonText = () => {
    const model = models.find((m: LLMModel) => m.id === selectedModel);
    return model ? model.name : "Select";
  };
  const hasModels = Array.isArray(models) && models.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="ml-4 p-4  rounded-lg h-12 min-w-40 w-min flex items-center justify-center">
          {getModelButtonText()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 bg-white borderrounded-md p-2 shadow-lg"
      >
        {loading && (
          <p className="text-center py-2">Loading models...</p>
        )}
        {error && (
          <p className="text-center py-2 text-red-500">
            Error loading models: {error}
          </p>
        )}
        {!loading && !error && hasModels ? (
          models.map((model: LLMModel) => (
            <DropdownMenuItem
              key={model.id}
              onClick={() => handleModelSelect(model.id)}
              className={`cursor-pointer mt-1 px-4 py-2 outlin rounded ${model.id === selectedModel
                ? "bg-pink-50 font-bold"
                : "hover:bg-gray-100"
                }`}
            >
              <div className="flex flex-col">
                <span className="font-bold">{model.name}</span>
                <span className="text-sm text-gray-500">
                  {model.description}
                </span>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <p className="text-center py-2 text-gray-500">
            No models available
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModelPicker;
