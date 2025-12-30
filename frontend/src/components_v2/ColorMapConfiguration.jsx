import { ArrowLeft, Calculator, Ruler, Info, Upload } from "./icons";
import colorMapImage from "../assets/color_map_crop.jpg";
import { Tooltip } from "react-tooltip";
import { useState, useRef } from "react";
import { convertToNumber, formatScientific, validateInput } from "../utils/helperFunctions";

const ColorMapConfiguration = ({
  croppedImageUrl,
  deviceImage,
  deviceWidth,
  deviceHeight,
  currentSelectionSize,
  topValue,
  bottomValue,
  onTopValueChange,
  onBottomValueChange,
  onCalculate,
  onBack,
  isLoading,
  colorMapSource,
  onColorMapSourceChange,
  customColorMapImage,
  onCustomColorMapChange,
}) => {
  // State for validation errors
  const [topValueError, setTopValueError] = useState("");
  const [bottomValueError, setBottomValueError] = useState("");
  const [showInfoBox, setShowInfoBox] = useState(false);
  const fileInputRef = useRef(null);

  // Helper function to truncate values if they're too long
  const truncateValue = (value) => {
    if (value === undefined || value === null) return "";
    const stringValue = String(value);
    return stringValue.length > 8
      ? `${stringValue.substring(0, 5)}...`
      : stringValue;
  };

  // Handle input change with validation
  const handleTopValueChange = (value) => {
    const isValid = validateInput(value, setTopValueError);
    if (isValid || !value) {
      onTopValueChange(value);
    }
  };

  const handleBottomValueChange = (value) => {
    const isValid = validateInput(value, setBottomValueError);
    if (isValid || !value) {
      onBottomValueChange(value);
    }
  };

  // Toggle info box
  const toggleInfoBox = () => {
    setShowInfoBox((prev) => !prev);
  };

  // Handle color map source change
  const handleColorMapSourceChange = (source) => {
    onColorMapSourceChange(source);
    if (source === "sentaurus") {
      onCustomColorMapChange(null);
    }
  };

  // Handle custom color map file upload
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onCustomColorMapChange({
            file: file,
            dataUrl: reader.result
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Get the color map image to display
  const getColorMapImage = () => {
    if (colorMapSource === "sentaurus") {
      return colorMapImage;
    } else {
      return customColorMapImage?.dataUrl || null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Color Map Configuration
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              Selected Region
            </h3>
            <div className="border rounded-lg overflow-hidden bg-gray-50 p-2">
              <div className="flex justify-center items-center">
                <img
                  src={croppedImageUrl || "/placeholder.svg"}
                  alt="Selected Region"
                  className="object-contain max-h-[300px] max-w-full"
                />
              </div>
            </div>

            <div className="mt-4 bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Ruler className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-blue-800">Measurement:</h4>
              </div>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="bg-white p-2 rounded-md text-center">
                  <div className="text-gray-500 mb-1">Area</div>
                  <div
                    className="font-medium text-blue-700 overflow-hidden whitespace-nowrap text-ellipsis w-full"
                    data-tooltip-id="measurement-tooltip"
                    data-tooltip-content={`${currentSelectionSize.area} sq. meters`}
                  >
                    {formatScientific(currentSelectionSize.area)} sq. m
                  </div>
                </div>
              </div>
              <Tooltip id="measurement-tooltip" place="top" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              Color Map Reference
            </h3>
            
            {/* Color Map Source Selection */}
            <div className="mb-4">
              <label
                htmlFor="colorMapSource"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Color Map Source:
              </label>
              <select
                id="colorMapSource"
                value={colorMapSource || "sentaurus"}
                onChange={(e) => handleColorMapSourceChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sentaurus">From Sentaurus TCAD</option>
                <option value="other">From other tools</option>
              </select>
            </div>

            {/* Color Map Display/Upload */}
            {colorMapSource === "sentaurus" ? (
              <div className="border rounded-lg overflow-hidden bg-gray-50 p-2 mb-6">
                <div className="flex justify-center items-center">
                  <img
                    src={getColorMapImage() || "/placeholder.svg"}
                    alt="Color Map"
                    className="object-contain max-h-[300px] max-w-full"
                  />
                </div>
              </div>
            ) : (
              <div className="mb-6">
                {customColorMapImage?.dataUrl ? (
                  <div>
                    <div className="border rounded-lg overflow-hidden bg-gray-50 p-2 mb-2">
                      <div className="flex justify-center items-center">
                        <img
                          src={customColorMapImage.dataUrl}
                          alt="Custom Color Map"
                          className="object-contain max-h-[300px] max-w-full"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                      >
                        <Upload className="h-4 w-4" />
                        Change Image
                      </button>
                      <button
                        onClick={() => onCustomColorMapChange(null)}
                        className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                      >
                        Remove
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-sm text-gray-600 mb-3">Upload your color map image</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        Select Color Map Reference Image
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Input help info box */}
            <div className="mb-4 relative">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Input Format
                </h4>
                <button
                  onClick={toggleInfoBox}
                  className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>

              {showInfoBox && (
                <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm text-blue-800 border border-blue-100">
                  <p className="mb-1 font-medium">Accepted formats:</p>
                  <p>Unit of parameter is not an input field. It is assumed to be consistent for the entire color map.</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Regular numbers: <span className="font-mono">123</span>,{" "}
                      <span className="font-mono">0.456</span>
                    </li>
                    <li>
                      Scientific notation using 'e':{" "}
                      <span className="font-mono">1.23e-10</span> = 1.23×10
                      <sup>-10</sup>
                    </li>
                    <li>
                      Negative values: <span className="font-mono">-45.6</span>,{" "}
                      <span className="font-mono">-7.8e-9</span>
                    </li>
                    <li>
                      Just 'e': <span className="font-mono">e</span> = 10¹
                      (represents 10)
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="topValue"
                  className="block text-sm font-medium text-gray-700"
                >
                  Maximum Value:
                </label>
                <input
                  id="topValue"
                  type="text"
                  value={topValue}
                  onChange={(e) => handleTopValueChange(e.target.value)}
                  placeholder="Enter Maximum value"
                  className={`w-full px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-500 ${
                    topValueError ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {topValueError && (
                  <p className="mt-1 text-sm text-red-600">{topValueError}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="bottomValue"
                  className="block text-sm font-medium text-gray-700"
                >
                  Minimum Value:
                </label>
                <input
                  id="bottomValue"
                  type="text"
                  value={bottomValue}
                  onChange={(e) => handleBottomValueChange(e.target.value)}
                  placeholder="Enter minimum value"
                  className={`w-full px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-500 ${
                    bottomValueError ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {bottomValueError && (
                  <p className="mt-1 text-sm text-red-600">
                    {bottomValueError}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Selection Summary
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {deviceImage && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Reference Device/Object of Interest
                </h3>
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                  <div className="w-16 h-16 border rounded overflow-hidden flex-shrink-0 flex justify-center items-center">
                    <img
                      src={deviceImage || "/placeholder.svg"}
                      alt="Reference Device"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dimensions:</p>
                    <div
                      className="text-sm font-medium whitespace-nowrap"
                      data-tooltip-id="dimension-tooltip"
                      data-tooltip-content={`${deviceWidth} × ${deviceHeight} sq. m`}
                    >
                      {formatScientific(deviceWidth)} ×{" "}
                      {formatScientific(deviceHeight)} sq. m
                    </div>
                    <Tooltip id="dimension-tooltip" place="top" />
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Selected Region
              </h3>
              <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                <div className="w-16 h-16 border rounded overflow-hidden flex-shrink-0 flex justify-center items-center">
                  <img
                    src={croppedImageUrl || "/placeholder.svg"}
                    alt="Selected Region"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Area:</p>
                  <div
                    className="text-sm font-medium "
                    data-tooltip-id="area-tooltip"
                    data-tooltip-content={`${currentSelectionSize.area} sq. meters`}
                  >
                    {formatScientific(currentSelectionSize.area)} sq. m
                  </div>
                  <Tooltip id="area-tooltip" place="top" />
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Color Map Values
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Top Value:</p>
                  <div
                    className="text-sm font-medium overflow-hidden whitespace-nowrap text-ellipsis"
                    data-tooltip-id="top-value-tooltip"
                    data-tooltip-content={convertToNumber(topValue) || "Not set"}
                  >
                    {topValue ? topValue : "Not set"}
                  </div>
                  <Tooltip id="top-value-tooltip" place="top" />
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Minimum Value:</p>
                  <div
                    className="text-sm font-medium overflow-hidden whitespace-nowrap text-ellipsis"
                    data-tooltip-id="bottom-value-tooltip"
                    data-tooltip-content={convertToNumber(bottomValue) || "Not set"}
                  >
                    {bottomValue ? bottomValue : "Not set"}
                  </div>
                  <Tooltip id="bottom-value-tooltip" place="top" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between border-t p-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={onCalculate}
              disabled={
                isLoading || 
                topValueError || 
                bottomValueError || 
                (colorMapSource === "other" && !customColorMapImage)
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-white transition-colors ${
                isLoading || 
                topValueError || 
                bottomValueError || 
                (colorMapSource === "other" && !customColorMapImage)
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isLoading ? "Processing..." : "Calculate"}
              {!isLoading && <Calculator className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorMapConfiguration;
