import React, { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateSelectedModel, toggleDropdown, setHoveredModel } from "../../redux/chatSlice";
import { AppDispatch, RootState } from "../../redux/store";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { fetchAvailableModels } from "../../redux/aynscThunks/chat";

const ModelPicker: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const showDropdown = useSelector((state: RootState) => state.chat.showDropdown);
  const hoveredModel = useSelector((state: RootState) => state.chat.hoveredModel);
  const selectedModel = useSelector((state: RootState) => state.chat.selectedModel);
  const models = useSelector((state: RootState) => state.chat.availableModels); // Fetch models from Redux state
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    dispatch(fetchAvailableModels());
  }, [dispatch]);

  const handleModelPickerClick = () => {
    dispatch(toggleDropdown());
  };

  const handleModelChange = (model: string) => {
    dispatch(updateSelectedModel(model));
    dispatch(toggleDropdown());
  };

  const handleMouseEnter = (modelId: string) => {
    dispatch(setHoveredModel(modelId));
  };

  const handleMouseLeave = () => {
    dispatch(setHoveredModel(null));
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
          <h3 className="text-lg text-black font-bold flex items-center mb-2">
            Model
          </h3>
          {models.map((model) => (
            <div
              key={model.id}
              onMouseEnter={() => handleMouseEnter(model.name)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleModelChange(model.name)}
              className={`w-full text-left text-md px-4 py-2 text-black font-thin flex items-center justify-between cursor-pointer rounded-md ${hoveredModel === model.id ? 'bg-gray-100' : ''}`}
            >
              <div className="flex flex-col truncate">
                <div className="font-normal text-sm truncate">{model.name}</div>
                {/* <div className="text-xs text-black font-extrathin truncate">{model.description}</div> */}
              </div>
              {selectedModel === model.name && (
                <CheckCircleIcon className="w-6 h-6 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelPicker;
