import { Copy, CheckCircle, Maximize2 } from "lucide-react"
import { formatDate, formatScientific } from "../../utils/helperFunctions"
import StatisticsPanel from "./statistics-panel"

const ComparisonView = ({ compareResultsData, results, copyToClipboard, copiedValue, onSelectResult }) => {
  if (compareResultsData.length !== 2) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg shadow-md mb-8 text-center">
        <p className="text-yellow-800">
          Please select two results to compare. Currently selected: {compareResultsData.length}/2
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
      {compareResultsData.map((result, idx) => (
        <div key={result.id} className="bg-white p-4 rounded-lg shadow-md relative">
          {/* Full Screen Button */}
          <button
            onClick={() => onSelectResult(result.id)}
            className="absolute top-2 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="View full result"
          >
            <Maximize2 size={20} className="text-gray-600" />
          </button>

          <h2 className="text-base font-semibold text-gray-800 mb-2 border-b pb-1">
            Result {results.indexOf(result) + 1} - {formatDate(result.timestamp)}
          </h2>

          <div className="flex justify-center mb-2">
            {/* Segmented Image */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50" style={{ maxWidth: '180px', maxHeight: '90px' }}>
              {result.segmentedImage ? (
                <img
                  src={result.segmentedImage || "/placeholder.svg"}
                  alt={`Segmented Image ${idx + 1}`}
                  className="w-full h-24 object-contain"
                />
              ) : (
                <div className="text-center py-6 text-gray-500 text-xs">No image available</div>
              )}
            </div>
          </div>

          {/* Compact Statistics Panel */}
          <StatisticsPanel
            selectedResultData={result}
            copyToClipboard={copyToClipboard}
            copiedValue={copiedValue}
            compact={true}
          />
        </div>
      ))}
    </div>
  )
}

const ComparisonStatCard = ({ title, value, color, idx, copyToClipboard, copiedValue }) => {
  const fieldId = `${title.toLowerCase()}-${idx}`

  return (
    <div className={`bg-gray-50 p-2 rounded border-l-4 border-${color}-500`}>
      <div className="flex justify-between">
        <div className="text-sm text-gray-700">{title}</div>
        <div className="flex items-center">
          {copiedValue === fieldId && (
            <span className="text-xs text-green-600 mr-1 flex items-center">
              <CheckCircle size={12} className="mr-1" /> Copied
            </span>
          )}
          <button
            onClick={() => copyToClipboard(value, fieldId)}
            className={`ml-2 p-1 rounded-full hover:bg-${color}-100`}
            aria-label="Copy value"
          >
            <Copy size={14} className={copiedValue === fieldId ? `text-${color}-500` : "text-gray-500"} />
          </button>
        </div>
      </div>
      <div className={`font-bold text-lg text-${color}-600 flex items-center`}>{formatScientific(value)}</div>
    </div>
  )
}

export default ComparisonView
