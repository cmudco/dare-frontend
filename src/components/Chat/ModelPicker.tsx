import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleDropdown, setApiKey } from "../../redux/chatSlice";
import { AppDispatch, RootState } from "../../redux/store";

import { getAvailableModels } from "../../redux/aynscThunks/chat";

const ModelPicker: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const showDropdown = useSelector((state: RootState) => state.chat.showDropdown);
  // const hoveredModel = useSelector((state: RootState) => state.chat.hoveredModel);
  // const selectedModel = useSelector((state: RootState) => state.chat.selectedModel);
  // const models = useSelector((state: RootState) => state.chat.availableModels);
  const apiKey = useSelector((state: RootState) => state.chat.apiKey);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [inputApiKey, setInputApiKey] = useState<string>("");

  useEffect(() => {
    if (apiKey) {
      dispatch(getAvailableModels());
    }
  }, [dispatch, apiKey]);

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

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputApiKey(e.target.value);
  };

  const handleApiKeySubmit = () => {
    if (inputApiKey.trim() !== "") {
      dispatch(setApiKey(inputApiKey));
    }
  };

  const handleApiKeyReset = () => {
    dispatch(setApiKey(""));
    setInputApiKey("");
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

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleModelPickerClick}
        className="ml-4 p-4 bg-pink-50 text-black rounded-lg h-12 w-12 flex items-center justify-center"
      >
        <span className="text-lg">M</span>
      </button>
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute right-0 bottom-full mb-2 bg-white border rounded-md p-6 w-hug whitespace-nowrap"
          style={{ boxShadow: "1.85px 1.85px 4.63px 0px #EE183C29, -1.85px -1.85px 4.63px 0px #EE183C29" }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg text-black font-bold flex items-center">
              Model
            </h3>
            {apiKey && (
              <button
                onClick={handleApiKeyReset}
                className="p-2 bg-primary text-white rounded-2xl"
              >
                Reset
              </button>
            )}
          </div>
            <div className="flex flex-col items-center">
              <input
                type="text"
                placeholder="Enter API Key"
                value={inputApiKey}
                onChange={handleApiKeyChange}
                className="mb-2 p-2 border rounded"
              />
              <button
                onClick={handleApiKeySubmit}
                className="p-2 bg-primary text-white rounded"
              >
                Submit
              </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default ModelPicker;
