import { useState, useRef, useEffect } from "react"
import { Tooltip } from "react-tooltip"
import { ArrowLeft, ArrowRight, Ruler } from "./icons"
import { formatScientific } from "../utils/helperFunctions"

const AreaSelection = ({ image, deviceWidth, deviceHeight, onComplete, onBack }) => {
  const [points, setPoints] = useState([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentSelectionSize, setCurrentSelectionSize] = useState({
    area: 0,
  })
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const previewCanvasRef = useRef(null)

  useEffect(() => {
    if (image && canvasRef.current) {
      const img = new Image()
      img.src = image
      img.onload = () => {
        imageRef.current = img
        setImageLoaded(true)
        const canvas = canvasRef.current
        canvas.width = img.width
        canvas.height = img.height
        drawImage()
      }
    }
  }, [image])

  const drawImage = () => {
    if (!canvasRef.current || !imageRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    ctx.drawImage(imageRef.current, 0, 0)
  }

  const drawPolygon = () => {
    if (!canvasRef.current || points.length === 0) return
    const ctx = canvasRef.current.getContext('2d')
    drawImage()
    
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    if (isDrawing) {
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y)
    } else {
      ctx.closePath()
    }
    ctx.strokeStyle = '#3B82F6'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'
    ctx.fill()
  }

  useEffect(() => {
    drawPolygon()
  }, [points, isDrawing])

  // Area calculation using deviceWidth/deviceHeight as the real-world dimensions
  const calculateArea = () => {
    if (points.length < 3 || !imageRef.current) return 0
    const imgW = imageRef.current.width
    const imgH = imageRef.current.height
    // Convert pixel points to real-world coordinates
    const realPoints = points.map(p => ({
      x: (p.x / imgW) * deviceWidth,
      y: (p.y / imgH) * deviceHeight
    }))
    let area = 0
    for (let i = 0; i < realPoints.length; i++) {
      const j = (i + 1) % realPoints.length
      area += realPoints[i].x * realPoints[j].y
      area -= realPoints[j].x * realPoints[i].y
    }
    area = Math.abs(area) / 2
    setCurrentSelectionSize({ area: Number.parseFloat(area) })
  }

  const handleCanvasClick = (e) => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = canvasRef.current.width / rect.width
    const scaleY = canvasRef.current.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY
    if (!isDrawing) {
      setIsDrawing(true)
      setPoints([{ x, y }])
    } else {
      setPoints([...points, { x, y }])
    }
  }

  const handleCanvasDoubleClick = () => {
    if (points.length >= 3) {
      setIsDrawing(false)
      calculateArea()
    }
  }

  const handleReset = () => {
    setPoints([])
    setIsDrawing(false)
    setCurrentSelectionSize({ area: 0 })
    if (canvasRef.current && imageRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      ctx.drawImage(imageRef.current, 0, 0)
    }
    if (previewCanvasRef.current) {
      const ctx = previewCanvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height)
    }
  }

  // Draw only the selected region in the preview
  useEffect(() => {
    if (!previewCanvasRef.current || !imageRef.current || points.length < 3 || isDrawing) return
    // Find bounding box
    const minX = Math.min(...points.map(p => p.x))
    const minY = Math.min(...points.map(p => p.y))
    const maxX = Math.max(...points.map(p => p.x))
    const maxY = Math.max(...points.map(p => p.y))
    const width = maxX - minX
    const height = maxY - minY
    // Set preview canvas size
    previewCanvasRef.current.width = width
    previewCanvasRef.current.height = height
    const ctx = previewCanvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, width, height)
    // Draw cropped image
    ctx.save()
    // Move context so polygon is at (0,0)
    ctx.translate(-minX, -minY)
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(imageRef.current, 0, 0)
    ctx.restore()
    // Draw polygon outline on preview
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(points[0].x - minX, points[0].y - minY)
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x - minX, points[i].y - minY)
    }
    ctx.closePath()
    ctx.strokeStyle = '#3B82F6'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.restore()
  }, [points, isDrawing, imageLoaded])

  const handleContinue = () => {
    if (points.length < 3) {
      alert("Please draw a complete shape first.")
      return
    }
    // Create a temporary canvas to get the cropped image
    const minX = Math.min(...points.map(p => p.x))
    const minY = Math.min(...points.map(p => p.y))
    const maxX = Math.max(...points.map(p => p.x))
    const maxY = Math.max(...points.map(p => p.y))
    const width = maxX - minX
    const height = maxY - minY

    // Create canvas for the cropped image
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = width
    tempCanvas.height = height
    const tempCtx = tempCanvas.getContext('2d')
    tempCtx.save()
    tempCtx.translate(-minX, -minY)
    tempCtx.beginPath()
    tempCtx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      tempCtx.lineTo(points[i].x, points[i].y)
    }
    tempCtx.closePath()
    tempCtx.clip()
    tempCtx.drawImage(imageRef.current, 0, 0)
    tempCtx.restore()
    const croppedImageUrl = tempCanvas.toDataURL('image/png')

    // Create canvas for the binary mask
    const maskCanvas = document.createElement('canvas')
    maskCanvas.width = width
    maskCanvas.height = height
    const maskCtx = maskCanvas.getContext('2d')
    maskCtx.fillStyle = 'black'
    maskCtx.fillRect(0, 0, width, height)
    maskCtx.fillStyle = 'white'
    maskCtx.beginPath()
    maskCtx.moveTo(points[0].x - minX, points[0].y - minY)
    for (let i = 1; i < points.length; i++) {
      maskCtx.lineTo(points[i].x - minX, points[i].y - minY)
    }
    maskCtx.closePath()
    maskCtx.fill()
    const maskImageUrl = maskCanvas.toDataURL('image/png')

    onComplete(croppedImageUrl, currentSelectionSize, maskImageUrl)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-2/3 bg-white rounded-lg shadow-md p-6 self-start">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Select Area to Analyze</h2>
        </div>
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Click to add points and create a shape. Double-click to complete the shape.
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Reset Selection
          </button>
        </div>
        <div className="flex justify-center">
          <div className="border rounded-lg overflow-hidden max-w-full">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onDoubleClick={handleCanvasDoubleClick}
              className="max-h-[500px] w-auto cursor-crosshair"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 justify-center">
          <Ruler className="h-4 w-4" />
          <span>
            Reference object: {formatScientific(deviceWidth)} × {formatScientific(deviceHeight)} sq. meters
          </span>
        </div>
      </div>
      <div className="lg:w-1/3 self-start">
        {points.length >= 3 && !isDrawing ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden h-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Selection Preview</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-center mb-4">
                <div className="border-2 border-blue-500 rounded-lg overflow-hidden p-1 bg-gray-50">
                  <canvas
                    ref={previewCanvasRef}
                    className="max-w-full h-auto max-h-[200px]"
                  />
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-3">Selection Measurements:</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white p-3 rounded-md flex justify-between items-center">
                    <span className="text-gray-500">Area:</span>
                    <div data-tooltip-id="area-tooltip"
                    data-tooltip-content={currentSelectionSize.area}>
                    {formatScientific(currentSelectionSize.area)} <span className="text-gray-500">sq. meters</span>
                    </div>
                    <Tooltip id="area-tooltip" place="top" />
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
                onClick={handleContinue}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-auto">
            <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 w-full">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Selection Preview</h3>
              <p className="text-gray-500 mb-4">Draw a shape in the image to see the preview here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AreaSelection