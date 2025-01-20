import React, { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleDropdown, updateSelectedModel } from "../../redux/chatSlice";
import { AppDispatch, RootState } from "../../redux/store";
import { getAvailableModels } from "../../redux/aynscThunks/chat";

const ModelPicker: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const showDropdown = useSelector((state: RootState) => state.chat.showDropdown);
  const selectedModel = useSelector((state: RootState) => state.chat.selectedModel);
  const models = useSelector((state: RootState) => state.chat.availableModels);

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

  const handleModelSelect = (model: string) => {
    dispatch(updateSelectedModel(model));
    dispatch(toggleDropdown());
  };

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
          style={{
            boxShadow: "1.85px 1.85px 4.63px 0px #EE183C29, -1.85px -1.85px 4.63px 0px #EE183C29",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg text-black font-bold flex items-center">
              Model
            </h3>
          </div>
          <ul className="space-y-2">
            {models.map((model) => (
              <li
                key={model.id}
                onClick={() => handleModelSelect(model.name)}
                className={`cursor-pointer px-4 py-2 rounded ${
                  model.name === selectedModel ? "bg-pink-50 font-bold" : "hover:bg-gray-100"
                }`}
              >
                {model.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ModelPicker;
