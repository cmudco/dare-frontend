import React, { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleDropdown, updateSelectedModel } from "../../redux/conversationSlice";
import { AppDispatch, RootState } from "../../redux/store";
import { getAvailableModels } from "../../redux/aynscThunks/conversation";
import { LLMModel } from "@/redux/types/conversation";

const ModelPicker: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const showDropdown = useSelector((state: RootState) => state.conversation.showDropdown);
  const selectedModel = useSelector((state: RootState) => state.conversation.selectedModel);
  const models = useSelector((state: RootState) => state.conversation.availableModels);
  const loading = useSelector((state: RootState) => state.conversation.loading);
  const error = useSelector((state: RootState) => state.conversation.error);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    dispatch(getAvailableModels());
  }, [dispatch]);

  const handleModelPickerClick = () => {
    dispatch(toggleDropdown());
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      dispatch(toggleDropdown());
    }
  };

  useEffect(() => {
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleModelSelect = (modelId: number) => {
    dispatch(updateSelectedModel(modelId));
    dispatch(toggleDropdown());
  };

  // Get display text for the model button
  const getModelButtonText = () => {
    const model = models.find((m: LLMModel) => m.id === selectedModel);
    return model ? model.name : "Select";
  };

  // Safely check if models is an array and has items
  const hasModels = Array.isArray(models) && models.length > 0;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleModelPickerClick}
        className="ml-4 p-4 bg-pink-50 text-black rounded-lg h-12 min-w-40 w-min flex items-center justify-center"
      >
        {getModelButtonText()}
      </button>
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute right-0 bottom-full mb-2 bg-white border rounded-md p-6 w-64 whitespace-nowrap z-50"
          style={{
            boxShadow: "1.85px 1.85px 4.63px 0px #EE183C29, -1.85px -1.85px 4.63px 0px #EE183C29",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg text-black font-bold flex items-center">
              Model
            </h3>
          </div>

          {loading && (
            <div className="text-center py-2">
              <p>Loading models...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-2 text-red-500">
              <p>Error loading models: {error}</p>
            </div>
          )}

          {!loading && !error && (
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {hasModels ? (
                models.map((model: LLMModel) => (
                  <li
                    key={model.id}
                    onClick={() => handleModelSelect(model.id)}
                    className={`cursor-pointer px-4 py-2 rounded ${(model.id) === selectedModel ? "bg-pink-50 font-bold" : "hover:bg-gray-100"
                      }`}
                    title={model.description || model.name}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold">{model.name}</div>
                        <div className="text-sm text-gray-500">{model.description}</div>
                      </div>
                      {model.id === selectedModel && (
                        <div className="text-primary">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-center py-2 text-gray-500">
                  No models available
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ModelPicker;
