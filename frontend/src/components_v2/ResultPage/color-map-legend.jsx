import { useState } from "react"
import { Info, Copy, CheckCircle } from "lucide-react"
import { Tooltip } from "react-tooltip"
import { formatScientific } from "../../utils/helperFunctions"

const ColorMapLegend = ({ loading, selectedResultData, copyToClipboard, copiedValue }) => {
  const [showInfo, setShowInfo] = useState(false)

  const toggleInfo = () => {
    setShowInfo(!showInfo)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className="bg-indigo-600 text-white px-4 py-3 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Color Map Legend</h2>
        <button
          onClick={toggleInfo}
          className="p-1 rounded-full hover:bg-indigo-500 transition-colors"
          aria-label="Show information"
        >
          <Info size={20} />
        </button>
      </div>

      {showInfo && (
        <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-3">
          <p className="text-indigo-900">
            Each tile displays:
            <ul className="list-disc pl-5 mt-1">
              <li>
                <span className="font-semibold">Color sample</span> representing the detected region
              </li>
              <li>
                <span className="font-semibold">Assigned value</span> in scientific notation
              </li>
              <li>
                <span className="font-semibold">Area</span> in units and percentage coverage
              </li>
            </ul>
            Hover over any tile to see detailed information including RGB values.
          </p>
        </div>
      )}
      <div className="p-5">
        {loading ? (
          <div className="text-center py-4">
            <p className="text-gray-500">Loading color map data...</p>
          </div>
        ) : selectedResultData.colorMapData?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {selectedResultData.colorMapData.map((item, index) => {
              // Calculate area in units (percentage * total area)
              const areaInUnits = (item.percentageArea / 100) * selectedResultData.measurements?.area
              const tooltipId = `tooltip-${index}`

              return (
                <div
                  key={index}
                  className="flex rounded-lg shadow-sm overflow-hidden"
                  data-tooltip-id={`color-tooltip-${index}`}
                >
                  {/* Color strip on the left */}
                  <div
                    className="w-8"
                    style={{
                      backgroundColor: `rgb(${item.r}, ${item.g}, ${item.b})`,
                    }}
                  ></div>

                  {/* Content area */}
                  <div className="flex-grow bg-gray-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-grow">
                        {/* Assigned Value */}
                        <div className="flex justify-between items-center mb-1">
                          <div className="text-sm text-gray-500">Assigned value:</div>
                          <div className="flex items-center">
                            {copiedValue === tooltipId && (
                              <span className="text-xs text-green-600 mr-1 flex items-center">
                                <CheckCircle size={12} className="mr-1" /> 
                              </span>
                            )}
                            <button
                              onClick={() => {
                                const tooltipText = `RGB: ${item.r}, ${item.g}, ${item.b}\nAssigned value: ${item.assignedValue}\nArea of selected region: ${areaInUnits}\nCoverage: ${item.percentageArea}%`
                                copyToClipboard(tooltipText, tooltipId)
                              }}
                              className="p-1 rounded-full flex items-center gap-1"
                              aria-label="Copy value"
                            >
                              <Copy
                                size={16}
                                className={copiedValue === tooltipId ? "text-green-500" : "text-gray-500"}
                              />
                            </button>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-indigo-600 overflow-hidden whitespace-nowrap text-ellipsis">
                          {formatScientific(item.assignedValue)}
                        </div>

                        {/* Area */}
                        <div className="flex justify-start items-center mt-2 mb-1">
                          <div className="text-sm text-gray-500">Area:</div>
                        </div>
                        <div className="text-lg font-bold text-green-600 overflow-hidden whitespace-nowrap text-ellipsis">
                          {formatScientific(areaInUnits)} ({item.percentageArea.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  </div>

                  <Tooltip id={`color-tooltip-${index}`} className="max-w-xs" place="top">
                    <div className="flex flex-col gap-2 p-1">
                      <div>
                        RGB: {item.r}, {item.g}, {item.b}
                      </div>
                      <div>Assigned value: {formatScientific(item.assignedValue)}</div>
                      <div>Area of selected region: {formatScientific(areaInUnits)}</div>
                      <div>Coverage: {item.percentageArea.toFixed(2)}%</div>
                    </div>
                  </Tooltip>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No color map data available</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ColorMapLegend
