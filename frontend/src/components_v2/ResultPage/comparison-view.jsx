import { Copy, CheckCircle } from "lucide-react"
import { formatDate, formatScientific } from "../../utils/helperFunctions"

const ComparisonView = ({ compareResultsData, results, copyToClipboard, copiedValue }) => {
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
        <div key={result.id} className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
            Result {results.indexOf(result) + 1} - {formatDate(result.timestamp)}
          </h2>

          <div className="flex justify-center mb-4 ">
            {/* Segmented Image */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              {result.segmentedImage ? (
                <img
                  src={result.segmentedImage || "/placeholder.svg"}
                  alt={`Segmented Image ${idx + 1}`}
                  className="w-full h-48 object-contain"
                />
              ) : (
                <div className="text-center py-12 text-gray-500">No image available</div>
              )}
            </div>
          </div>

          {/* Key Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <ComparisonStatCard
              title="Average"
              value={result.average}
              color="green"
              idx={idx}
              copyToClipboard={copyToClipboard}
              copiedValue={copiedValue}
            />

            <ComparisonStatCard
              title="Mean"
              value={result.stats?.mean}
              color="blue"
              idx={idx}
              copyToClipboard={copyToClipboard}
              copiedValue={copiedValue}
            />

            <ComparisonStatCard
              title="Median"
              value={result.stats?.median}
              color="purple"
              idx={idx}
              copyToClipboard={copyToClipboard}
              copiedValue={copiedValue}
            />

            <ComparisonStatCard
              title="Mode"
              value={result.stats?.mode}
              color="yellow"
              idx={idx}
              copyToClipboard={copyToClipboard}
              copiedValue={copiedValue}
            />
          </div>
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
