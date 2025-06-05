import { useState } from "react"
import { Info, X, Copy, CheckCircle } from "lucide-react"
import { formatScientific } from "../../utils/helperFunctions"
import { MathJax } from "better-react-mathjax"

const StatisticsPanel = ({ selectedResultData, copyToClipboard, copiedValue, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleStatisticsInfo = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className={compact ? "mb-2" : "mb-8"}>
      <div className={compact ? "bg-white p-2 rounded shadow-sm" : "bg-white p-5 rounded-lg shadow-md"}>
        <div className={compact ? "flex justify-between border-b pb-1 mb-2" : "flex justify-between border-b pb-2 mb-4"}>
          <h2 className={compact ? "text-base font-semibold text-gray-800" : "text-2xl font-bold text-gray-800"}>Statistical Analysis</h2>
          <div className="relative">
            <button
              onClick={toggleStatisticsInfo}
              className={compact ? "hover:bg-gray-200 text-gray-700 rounded-full p-1" : "hover:bg-gray-300 text-gray-700 rounded-full p-1 focus:outline-none transition-colors"}
              aria-label="Information about statistics"
            >
              <Info size={compact ? 16 : 20} />
            </button>

            {isOpen && (
              <div className="absolute right-0 top-8 w-80 md:w-96 bg-white rounded-lg shadow-lg p-4 z-10 border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg text-gray-800">Statistical Measures</h3>
                  <button
                    onClick={toggleStatisticsInfo}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label="Close information panel"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-[#27272A] mb-1">Weighted Average</h4>
                    <div className="my-2 text-center">
                      <MathJax>{`\\[
                        \\bar{s} = \\frac{\\sum_{i=1}^{n} S_i A_i}{\\sum_{i=1}^{n} A_i}
                      \\]`}</MathJax>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-[#27272A] mb-1">Arithmetic Mean</h4>
                    <div className="my-2 text-center">
                      <MathJax>{`\\[
                        \\bar{s}_{\\text{simple}} = \\frac{1}{n} \\sum_{i=1}^{n} S_i
                      \\]`}</MathJax>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={compact ? "grid grid-cols-2 gap-2" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"}>
          {/* Average Value */}
          <StatisticCard
            title="Weighted Average"
            value={selectedResultData.average}
            fieldName="average"
            copyToClipboard={copyToClipboard}
            copiedValue={copiedValue}
            compact={compact}
          />

          {/* Mean */}
          <StatisticCard
            title="Mean"
            value={selectedResultData.stats?.mean}
            fieldName="mean"
            copyToClipboard={copyToClipboard}
            copiedValue={copiedValue}
            compact={compact}
          />

          {/* Median */}
          <StatisticCard
            title="Median"
            value={selectedResultData.stats?.median}
            fieldName="median"
            copyToClipboard={copyToClipboard}
            copiedValue={copiedValue}
            compact={compact}
          />

          {/* Mode */}
          <StatisticCard
            title="Mode"
            value={selectedResultData.stats?.mode}
            fieldName="mode"
            copyToClipboard={copyToClipboard}
            copiedValue={copiedValue}
            compact={compact}
          />

          {/* Min Assigned Value */}
          <StatisticCard
            title="Min Assigned Value"
            value={selectedResultData.stats?.minAssignedValue}
            fieldName="minAssignedValue"
            copyToClipboard={copyToClipboard}
            copiedValue={copiedValue}
            compact={compact}
          />

          {/* Max Assigned Value */}
          <StatisticCard
            title="Max Assigned Value"
            value={selectedResultData.stats?.maxAssignedValue}
            fieldName="maxAssignedValue"
            copyToClipboard={copyToClipboard}
            copiedValue={copiedValue}
            compact={compact}
          />

          {/* Number of Segments */}
          <StatisticCard
            title="No. of Segments"
            value={selectedResultData.stats?.numSegments}
            fieldName="numSegments"
            copyToClipboard={copyToClipboard}
            copiedValue={copiedValue}
            formatValue={(value) => value}
            compact={compact}
          />

          {/* Total number of Pixels */}
          <StatisticCard
            title="Total no. of Pixels"
            value={selectedResultData.stats?.totalPixel}
            fieldName="totalPixel"
            copyToClipboard={copyToClipboard}
            copiedValue={copiedValue}
            formatValue={(value) => value}
            compact={compact}
          />
        </div>
      </div>
    </div>
  )
}

const StatisticCard = ({
  title,
  value,
  fieldName,
  copyToClipboard,
  copiedValue,
  formatValue = formatScientific,
  compact = false,
}) => {
  return (
    <div className={`${compact ? "bg-gray-50 p-2" : "bg-gray-50 p-4"} rounded-lg shadow-sm border-l-4 border-[#27272A] overflow-hidden`}>
      <div className="flex justify-between">
        <h3 className={`${compact ? "text-xs" : "text-lg"} font-semibold text-[#27272A] mb-1`}>{title}</h3>
        <div className="flex items-center">
          {copiedValue === fieldName && (
            <span className="text-xs text-green-600 mr-1 flex items-center">
              <CheckCircle size={compact ? 10 : 12} className="mr-1" />
            </span>
          )}
          {value !== undefined && (
            <button
              onClick={() => copyToClipboard(value, fieldName)}
              className={`${compact ? "p-0.5" : "p-1"} rounded-full hover:bg-gray-200`}
              aria-label="Copy value"
            >
              <Copy size={compact ? 12 : 16} className={copiedValue === fieldName ? "text-[#27272A]" : "text-gray-500"} />
            </button>
          )}
        </div>
      </div>
      {value !== undefined ? (
        <div className="flex items-center">
          <div
            className={`${compact ? "text-base" : "text-2xl"} font-bold text-[#27272A] overflow-hidden whitespace-nowrap text-ellipsis mr-1`}
            data-tooltip-id="value-tooltip"
            data-tooltip-content={value}
          >
            {formatValue(value)}
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Not available</p>
      )}
    </div>
  )
}

export default StatisticsPanel
