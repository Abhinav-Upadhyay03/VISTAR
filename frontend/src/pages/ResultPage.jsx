import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Tooltip } from "react-tooltip"
import HistorySidebar from "../components_v2/ResultPage/history-sidebar"
import ComparisonView from "../components_v2/ResultPage/comparison-view"
import StatisticsPanel from "../components_v2/ResultPage/statistics-panel"
import ColorMapLegend from "../components_v2/ResultPage/color-map-legend"
import { formatDate } from "../utils/helperFunctions"

const ResultPage = ({ average, segmentedImage, graphImageUrl, stats, colorMapData, measurements, onBack }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!colorMapData)
  const [selectedResult, setSelectedResult] = useState(null)
  const [results, setResults] = useState([])
  const [comparingResults, setComparingResults] = useState(false)
  const [compareSelections, setCompareSelections] = useState([])
  const [copiedValue, setCopiedValue] = useState(null)

  // Initialize with current result when component mounts
  useEffect(() => {
    if (colorMapData) {
      setLoading(false)

      // Create current result object with unique ID
      const currentResult = {
        id: `result_${Date.now()}`,
        timestamp: new Date(),
        average,
        segmentedImage,
        graphImageUrl,
        stats,
        colorMapData,
        measurements,
      }

      // Load existing results from localStorage
      const savedResults = JSON.parse(localStorage.getItem("analysisResults") || "[]")

      // Add current result to the list (only if it's not already there)
      const resultExists = savedResults.some(
        (r) => r.average === currentResult.average && r.segmentedImage === currentResult.segmentedImage,
      )

      let updatedResults
      if (!resultExists) {
        updatedResults = [currentResult, ...savedResults]
      } else {
        updatedResults = savedResults
      }

      // Update state and localStorage
      setResults(updatedResults)
      setSelectedResult(resultExists ? savedResults[0]?.id : currentResult.id)
      localStorage.setItem("analysisResults", JSON.stringify(updatedResults))
    }
  }, [colorMapData])

  // Initialize compare selections with the two most recent results
  useEffect(() => {
    if (results.length >= 2 && compareSelections.length === 0) {
      setCompareSelections([results[0].id, results[1].id])
    } else if (results.length === 1 && compareSelections.length === 0) {
      setCompareSelections([results[0].id])
    }
  }, [results, compareSelections])

  const handleHomeScreenClick = () => {
    navigate("/")
  }

  const selectResult = (resultId) => {
    setSelectedResult(resultId)
    setComparingResults(false)
  }

  const removeResult = (resultId, e) => {
    e.stopPropagation()
    // Remove the result from the list
    const updatedResults = results.filter((result) => result.id !== resultId)

    // Update state and localStorage
    setResults(updatedResults)
    localStorage.setItem("analysisResults", JSON.stringify(updatedResults))

    // If the removed result was selected, select the first available result
    if (selectedResult === resultId && updatedResults.length > 0) {
      setSelectedResult(updatedResults[0].id)
    }

    // Update compare selections if needed
    setCompareSelections((prev) => prev.filter((id) => id !== resultId))
  }

  const clearAllResults = () => {
    // Keep only the current result
    const currentResult = results.find((result) => result.id === selectedResult)
    const updatedResults = currentResult ? [currentResult] : []

    // Update state and localStorage
    setResults(updatedResults)
    localStorage.setItem("analysisResults", JSON.stringify(updatedResults))

    // Reset compare selections
    if (currentResult) {
      setCompareSelections([currentResult.id])
    } else {
      setCompareSelections([])
    }
  }

  const toggleCompareMode = () => {
    if (!comparingResults && results.length >= 2) {
      // If we don't have 2 selections yet, use the two most recent results
      if (compareSelections.length < 2) {
        setCompareSelections([results[0].id, results[1].id])
      }
    }
    setComparingResults(!comparingResults)
  }

  const toggleCompareSelection = (resultId) => {
    if (compareSelections.includes(resultId)) {
      // Remove from selections if already selected
      setCompareSelections((prev) => prev.filter((id) => id !== resultId))
    } else {
      // Add to selections if not already selected (max 2)
      if (compareSelections.length < 2) {
        setCompareSelections((prev) => [...prev, resultId])
      } else {
        // Replace the first selection if we already have 2
        setCompareSelections((prev) => [prev[1], resultId])
      }
    }
  }

  // Copy value to clipboard
  const copyToClipboard = (value, fieldName) => {
    navigator.clipboard.writeText(value.toString())
    setCopiedValue(fieldName)
    setTimeout(() => {
      setCopiedValue(null)
    }, 2000)
  }

  // Get the currently selected result data
  const getSelectedResultData = () => {
    if (!selectedResult) return null
    return results.find((result) => result.id === selectedResult)
  }

  // Get the selected results for comparison
  const getCompareResults = () => {
    return results.filter((result) => compareSelections.includes(result.id))
  }

  const selectedResultData = getSelectedResultData()
  const compareResultsData = getCompareResults()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* History Sidebar */}
      <HistorySidebar
        results={results}
        selectedResult={selectedResult}
        comparingResults={comparingResults}
        compareSelections={compareSelections}
        onSelectResult={selectResult}
        onRemoveResult={removeResult}
        onClearAllResults={clearAllResults}
        onToggleCompareMode={toggleCompareMode}
        onToggleCompareSelection={toggleCompareSelection}
      />

      {/* Main Content */}
      <div className="flex-1">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                {comparingResults ? "Results Comparison" : "Analysis Results"}
              </h1>
              {selectedResultData && !comparingResults && (
                <div className="text-sm text-gray-600">{formatDate(selectedResultData.timestamp)}</div>
              )}
            </div>

            {/* Comparison Mode UI */}
            {comparingResults && (
              <ComparisonView
                compareResultsData={compareResultsData}
                results={results}
                copyToClipboard={copyToClipboard}
                copiedValue={copiedValue}
              />
            )}

            {/* Regular Result View (when not comparing) */}
            {!comparingResults && selectedResultData && (
              <>
                {/* Main content without card wrapper */}
                <div className="mb-8">
                  <div className="">
                    {/* Input Image Section */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="bg-green-600 text-white px-4 py-3">
                        <h2 className="text-xl font-semibold">Input Image</h2>
                      </div>
                      <div className="p-4">
                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                          {selectedResultData.segmentedImage ? (
                            <img
                              src={selectedResultData.segmentedImage || "/placeholder.svg" || "/placeholder.svg"}
                              alt="Segmented"
                              className="w-full max-h-96 object-contain"
                            />
                          ) : (
                            <div className="text-center py-12 text-gray-500">No image available</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics Section */}
                <StatisticsPanel
                  selectedResultData={selectedResultData}
                  copyToClipboard={copyToClipboard}
                  copiedValue={copiedValue}
                />

                {/* Color Map Legend */}
                <ColorMapLegend
                  loading={loading}
                  selectedResultData={selectedResultData}
                  copyToClipboard={copyToClipboard}
                  copiedValue={copiedValue}
                />
              </>
            )}

            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={handleHomeScreenClick}
                className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition duration-200 transform hover:scale-105"
              >
                Return to Home Screen
              </button>
            </div>
          </div>
        </div>
      </div>

      <Tooltip id="value-tooltip" place="top" />
    </div>
  )
}



export default ResultPage
