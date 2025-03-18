import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
;
import { AppDispatch, RootState } from "../../redux/store";
import { updateTemperature } from "../../redux/conversationSlice";
import { Slider } from "../ui/slider";
import { Thermometer } from "lucide-react";

const TemperaturePicker: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const temperature = useSelector(
    (state: RootState) => state.conversation.temperature || 0.7
  );

  const handleTemperatureChange = (values: number[]) => {
    dispatch(updateTemperature(values[0]));
  };

  const getTemperatureDescription = () => {
    if (temperature <= 0.3) return "More precise, deterministic responses";
    if (temperature <= 0.7) return "Balanced creativity and coherence";
    return "More creative, diverse responses";
  };

  const getTemperatureColor = () => {
    if (temperature <= 0.3) return "text-blue-500";
    if (temperature <= 0.7) return "text-green-500";
    return "text-red-500";
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="ml-4  flex justify-center items-center font-normal normal-case rounded-lg h-12 py-0 whitespace-nowrap " variant='outline'>
          <Thermometer
            className={`!w-5 !h-5 ${getTemperatureColor()}`}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Temperature</h4>
            <span className="bg-gray-100 px-2 py-1 rounded-md text-sm font-mono">
              {temperature.toFixed(1)}
            </span>
          </div>

          <Slider
            defaultValue={[temperature]}
            min={0}
            max={1}
            step={0.1}
            onValueChange={handleTemperatureChange}
            className="my-4 cursor-pointer"
          />

          <div className="flex justify-between text-xs text-gray-500 px-1">
            <span>Precise</span>
            <span>Balanced</span>
            <span>Creative</span>
          </div>

          <div className={`mt-2 text-sm ${getTemperatureColor()}`}>
            {getTemperatureDescription()}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Temperature controls randomness. Lower values are more deterministic, while higher values produce more varied responses.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TemperaturePicker;