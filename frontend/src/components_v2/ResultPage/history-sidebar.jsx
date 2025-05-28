import { useState } from "react"
import { History, FileText, Calendar, CheckCircle, X, Info, BarChart2, Trash2, Edit2 } from "lucide-react"
import { formatDate, formatScientific } from "../../utils/helperFunctions"

const HistorySidebar = ({
  results,
  selectedResult,
  comparingResults,
  compareSelections,
  onSelectResult,
  onRemoveResult,
  onClearAllResults,
  onToggleCompareMode,
  onToggleCompareSelection,
  resultTitles,
  editingTitle,
  setEditingTitle,
  onTitleChange,
}) => {
  const [showCompareInfo, setShowCompareInfo] = useState(false)

  const toggleCompareInfo = () => {
    setShowCompareInfo(!showCompareInfo)
  }

  const handleTitleEdit = (resultId, e) => {
    e.stopPropagation()
    setEditingTitle(resultId)
  }

  const handleTitleSubmit = (resultId, e) => {
    e.preventDefault()
    const newTitle = e.target.value.trim()
    if (newTitle) {
      onTitleChange(resultId, newTitle)
    }
  }

  return (
    <div className="bg-white shadow-xl flex flex-col w-72 md:w-80 lg:w-80 max-h-[80vh] overflow-hidden">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center">
            <History size={20} className="mr-2" /> Results History
          </h2>
        </div>
      </div>

      {/* Scrollable content area */}
      <div
        className="flex-1 overflow-y-auto custom-scrollbar"
        style={{
          maxHeight: "calc(80vh - 140px)",
        }}
      >
        <div className="p-3 space-y-3">
          {results.length > 0 ? (
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  onClick={() => (comparingResults ? onToggleCompareSelection(result.id) : onSelectResult(result.id))}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border relative ${
                    comparingResults
                      ? compareSelections.includes(result.id)
                        ? "bg-indigo-50 border-indigo-300 shadow-md"
                        : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                      : selectedResult === result.id
                        ? "bg-blue-50 border-blue-300 shadow-md"
                        : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  {comparingResults && compareSelections.includes(result.id) && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle size={16} className="text-indigo-600" />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-800 flex items-center">
                      <FileText size={16} className="mr-2 text-blue-600" />
                      {editingTitle === result.id ? (
                        <input
                          type="text"
                          defaultValue={resultTitles[result.id] || `Result ${index + 1}`}
                          className="border border-gray-300 rounded px-1 py-0.5 text-sm w-32"
                          onClick={(e) => e.stopPropagation()}
                          onBlur={(e) => handleTitleSubmit(result.id, e)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleTitleSubmit(result.id, e)
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center group">
                          <span>{resultTitles[result.id] || `Result ${index + 1}`}</span>
                          <button
                            onClick={(e) => handleTitleEdit(result.id, e)}
                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit2 size={14} className="text-gray-400 hover:text-blue-600" />
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => onRemoveResult(result.id, e)}
                      className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove result"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mb-2 flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {formatDate(result.timestamp)}
                  </div>
                  <div className="flex space-x-2 text-sm">
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded-md font-medium">
                      Avg: {formatScientific(result.average)}
                    </div>
                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-medium">
                      Mean: {formatScientific(result.stats?.mean)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 flex flex-col items-center">
              <History size={40} className="mb-3 text-gray-300" />
              <p>No saved results</p>
              <p className="text-xs mt-1 text-gray-400">Results will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed footer with buttons - always visible */}
      <div className="sticky bottom-0 p-4 bg-gray-50 border-t border-gray-200 mt-auto">
        {results.length > 1 && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <button
                onClick={onToggleCompareMode}
                className={`w-full flex items-center justify-center px-4 py-2.5 rounded-lg transition-colors ${
                  comparingResults
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                }`}
              >
                <BarChart2 size={16} className="mr-2" />
                {comparingResults ? "Exit Compare Mode" : "Compare Results"}
              </button>
              <button
                onClick={toggleCompareInfo}
                className="ml-2 p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                aria-label="Compare information"
              >
                <Info size={16} />
              </button>
            </div>

            {showCompareInfo && (
              <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800 mb-3">
                <p>
                  <span className="font-semibold">Compare Mode:</span> Select two results to compare side by side.
                  {comparingResults && " Click on results to select/deselect them for comparison."}
                </p>
              </div>
            )}
          </div>
        )}

        {results.length > 1 && (
          <button
            onClick={onClearAllResults}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 size={16} className="mr-2" /> Clear History
          </button>
        )}
      </div>
    </div>
  )
}

export default HistorySidebar
