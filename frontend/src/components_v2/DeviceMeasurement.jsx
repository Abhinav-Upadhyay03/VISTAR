import { useState, useRef } from "react"
import ReactCrop from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Info, X, ArrowRight } from "./icons"
import { getCroppedImg } from "../utils/imageUtils"
import { convertToNumber, validateInput } from "../utils/helperFunctions"
import { Tooltip } from "react-tooltip"

const DeviceMeasurement = ({ image, onComplete, onCancel }) => {
  const [deviceCrop, setDeviceCrop] = useState()
  const [deviceCroppedUrl, setDeviceCroppedUrl] = useState(null)
  const [deviceWidth, setDeviceWidth] = useState("")
  const [deviceHeight, setDeviceHeight] = useState("")
  const [widthError, setWidthError] = useState("")
  const [heightError, setHeightError] = useState("")
  const [showInfoBox, setShowInfoBox] = useState(false)
  const deviceImageRef = useRef(null)

  const handleDeviceCropChange = (newCrop) => {
    setDeviceCrop(newCrop)
  }

  const handleDeviceCropComplete = async (crop) => {
    if (deviceImageRef.current && crop.width && crop.height) {
      try {
        const croppedImage = await getCroppedImg(deviceImageRef.current, crop)
        setDeviceCroppedUrl(croppedImage)
      } catch (error) {
        alert("Error cropping device image. Please try again.")
      }
    }
  }

  const handleWidthChange = (value) => {
    const isValid = validateInput(value, setWidthError);
    if (isValid || !value) {
      setDeviceWidth(value);
    }
  };

  const handleHeightChange = (value) => {
    const isValid = validateInput(value, setHeightError);
    if (isValid || !value) {
      setDeviceHeight(value);
    }
  };

  const toggleInfoBox = () => {
    setShowInfoBox(prev => !prev);
  };

  const handleProceedFromDevice = () => {
    // Validate device dimensions
    if (!deviceWidth || !deviceHeight || !deviceCroppedUrl) {
      alert("Please crop the device and enter its dimensions first.")
      return
    }

    if (widthError || heightError) {
      alert("Please fix the input errors before proceeding.")
      return;
    }

    // Convert scientific notation to regular numbers
    const numericWidth = convertToNumber(deviceWidth);
    const numericHeight = convertToNumber(deviceHeight);

    // Calculate pixel to unit ratio
    if (deviceCrop && deviceCrop.width && deviceCrop.height) {
      const widthRatio = numericWidth / deviceCrop.width
      const heightRatio = numericHeight / deviceCrop.height

      // Only pass width/height for scaling, not as part of the selected region's measurements
      onComplete(deviceCroppedUrl, numericWidth, numericHeight, { width: widthRatio, height: heightRatio })
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="px-0 pt-0 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Select Reference Object</h2>
        </div>

        <div className="mb-4 bg-blue-50 border-blue-200 p-4 rounded-lg flex items-start">
          <Info className="h-4 w-4 text-blue-500 mt-1 mr-2" />
          <p className="text-blue-700">
            Draw a box around the device with known dimensions for measurement calibration.
          </p>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <ReactCrop
            crop={deviceCrop}
            onChange={handleDeviceCropChange}
            onComplete={handleDeviceCropComplete}
            className="max-h-[600px]"
          >
            <img
              ref={deviceImageRef}
              src={image || "/placeholder.svg"}
              alt="Device"
              className="object-contain w-full"
              onLoad={(e) => {
                deviceImageRef.current = e.currentTarget
              }}
            />
          </ReactCrop>
        </div>
      </div>

      <div>
        {deviceCroppedUrl ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Reference Object Details</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-center mb-4">
                <div className="border-2 border-blue-500 rounded-lg overflow-hidden p-1 bg-gray-50">
                  <img
                    src={deviceCroppedUrl || "/placeholder.svg"}
                    alt="Cropped Device"
                    className="max-w-full h-auto max-h-[200px]"
                  />
                </div>
              </div>

              {/* Input help info box for units and format */}
              <div className="mb-4 relative">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Value Input Format
                  </h4>
                  <button
                  tabIndex={-1}
                    onClick={toggleInfoBox}
                    className="p-1 rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
                    data-tooltip-id="format-tooltip"
                    data-tooltip-content="Click for input format help"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                  <Tooltip id="format-tooltip" place="top" />
                </div>

                {showInfoBox && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm text-blue-800 border border-blue-100">
                    <p className="mb-1 font-medium">Important notes:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Please enter dimensions in <span className="font-bold">meters</span></li>
                      <li>
                        Accepted formats:
                        <ul className="pl-4 mt-1">
                          <li>
                            Regular numbers: <span className="font-mono">123</span>,{" "}
                            <span className="font-mono">0.456</span>
                          </li>
                          <li>
                            Scientific notation: <span className="font-mono">1.23e-10</span> = 1.23×10
                            <sup>-10</sup>
                          </li>
                          <li>
                            Just 'e': <span className="font-mono">e</span> = 10¹
                            (represents 10)
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="deviceWidth" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    Object Lateral:
                    <button
                      tabIndex={-1}
                      className="p-1 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                      data-tooltip-id="width-tooltip"
                      data-tooltip-content="Enter width in meters"
                    >
                      <Info className="h-3 w-3" />
                    </button>
                    <Tooltip id="width-tooltip" place="top" />
                  </label>
                  <div className="flex">
                    <input
                      id="deviceWidth"
                      type="text"
                      value={deviceWidth}
                      onChange={(e) => handleWidthChange(e.target.value)}
                      placeholder="e.g., 15.6, 1.5e-2"
                      className={`flex-grow px-3 py-2 border rounded-l outline-none focus:outline-none ${
                        widthError ? "border-red-500" : ""
                      }`}
                    />
                    <div className="bg-gray-100 text-gray-700 px-3 py-2 border border-l-0 rounded-r inline-flex items-center">
                      meters
                    </div>
                  </div>
                  {widthError && (
                    <p className="mt-1 text-sm text-red-600">{widthError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="deviceHeight" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    Object Vertical:
                    <button
                      tabIndex={-1}
                      className="p-1 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                      data-tooltip-id="height-tooltip"
                      data-tooltip-content="Enter height in meters"
                    >
                      <Info className="h-3 w-3" />
                    </button>
                    <Tooltip id="height-tooltip" place="top" />
                  </label>
                  <div className="flex">
                    <input
                      id="deviceHeight"
                      type="text"
                      value={deviceHeight}
                      onChange={(e) => handleHeightChange(e.target.value)}
                      placeholder="e.g., 10.5, 3e-3"
                      className={`flex-grow px-3 py-2 border rounded-l outline-none focus:outline-none ${
                        heightError ? "border-red-500" : ""
                      }`}
                    />
                    <div className="bg-gray-100 text-gray-700 px-3 py-2 border border-l-0 rounded-r inline-flex items-center">
                      meters
                    </div>
                  </div>
                  {heightError && (
                    <p className="mt-1 text-sm text-red-600">{heightError}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-between border-t p-4">
              <button
                onClick={onCancel}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                onClick={handleProceedFromDevice}
                className={`flex items-center gap-2 px-4 py-2 ${
                  widthError || heightError ? "bg-blue-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                } text-white rounded-md transition-colors`}
                disabled={widthError || heightError}
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Reference Object Preview</h3>
              <p className="text-gray-500 mb-4">Select an area in the image to see the preview here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DeviceMeasurement
