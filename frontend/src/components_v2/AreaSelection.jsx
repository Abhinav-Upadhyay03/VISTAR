import { useState, useRef, useEffect } from "react"
import { Tooltip } from "react-tooltip"
import { ArrowLeft, ArrowRight, Ruler, MousePointer, Edit3, Plus, Trash2, ZoomIn, ZoomOut, Info, RotateCcw } from "./icons"
import { formatScientific } from "../utils/helperFunctions"

const AreaSelection = ({ image, deviceWidth, deviceHeight, onComplete, onBack }) => {
  const [points, setPoints] = useState([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentSelectionSize, setCurrentSelectionSize] = useState({
    area: 0,
  })
  const [mode, setMode] = useState("interactive") // 'interactive' or 'coordinate'
  const [coordinateInput, setCoordinateInput] = useState({ x: "", y: "" })
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const previewCanvasRef = useRef(null)
  const [showInstructions, setShowInstructions] = useState(false)

  // Zoom and Pan state
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const lastMousePositionRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false); // To distinguish click from drag
  const MAX_SCALE = 10;
  const MIN_SCALE = 0.1;
  const ZOOM_STEP_FACTOR = 1.2; // Factor for button zoom

  useEffect(() => {
    if (image && canvasRef.current) {
      const img = new Image()
      img.src = image
      img.crossOrigin = "anonymous"
      img.onload = () => {
        imageRef.current = img
        setImageLoaded(true)
        const canvas = canvasRef.current
        // Set canvas physical size (CSS independent)
        canvas.width = img.width
        canvas.height = img.height
        // Reset scale and offset when image loads
        setScale(1)
        setOffset({ x: 0, y: 0 })
        drawImage()
      }
    }
  }, [image])

  const drawImage = () => {
    if (!canvasRef.current || !imageRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // Clear canvas with transparent color
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Save context state
    ctx.save()

    // Apply transformations
    ctx.translate(offset.x, offset.y)
    ctx.scale(scale, scale)

    // Draw the image
    ctx.drawImage(imageRef.current, 0, 0)

    // Restore context state
    ctx.restore()
  }

  const drawPolygon = () => {
    if (!canvasRef.current || !imageRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    drawImage() // Redraw image first

    if (points.length === 0) return

    ctx.save()
    ctx.translate(offset.x, offset.y)
    ctx.scale(scale, scale)

    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    if (isDrawing && points.length > 0) {
      // For interactive drawing, line to the last point if drawing, or close path if not
      const lastPoint = points[points.length - 1];
      // No need to explicitly draw a line to the current mouse cursor for preview, that's a different logic.
    }
    if (!isDrawing && points.length >= 3) {
      ctx.closePath()
    }

    ctx.strokeStyle = "#3B82F6"
    ctx.lineWidth = 2 / scale // Adjust line width based on scale
    ctx.stroke()

    if (!isDrawing && points.length >=3 ) {
        ctx.fillStyle = "rgba(59, 130, 246, 0.1)"
        ctx.fill()
    }


    // Draw point markers
    const pointRadius = 4 / scale // Adjust point radius
    points.forEach((point, index) => {
      ctx.fillStyle = "#3B82F6"
      ctx.beginPath()
      ctx.arc(point.x, point.y, pointRadius, 0, 2 * Math.PI)
      ctx.fill()

      // Add point numbers
      ctx.fillStyle = "white"
      ctx.font = `${12 / scale}px Arial` // Adjust font size
      ctx.textAlign = "center"
      ctx.fillText((index + 1).toString(), point.x, point.y + pointRadius / 2 + (4/scale) ) // Adjust text position
      ctx.fillStyle = "#3B82F6"
    })
    ctx.restore()
  }


  useEffect(() => {
    drawPolygon()
  }, [points, isDrawing, scale, offset, imageLoaded]) // Redraw when scale or offset changes


  // Area calculation using deviceWidth/deviceHeight as the real-world dimensions
  const calculateArea = () => {
    if (points.length < 3 || !imageRef.current) return 0
    const imgW = imageRef.current.width
    const imgH = imageRef.current.height
    // Convert pixel points to real-world coordinates
    const realPoints = points.map((p) => ({
      x: (p.x / imgW) * deviceWidth,
      y: (p.y / imgH) * deviceHeight,
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

  const getMousePositionOnCanvas = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    // Convert client coordinates to canvas coordinates (considering CSS scaling of the canvas element itself)
    const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
    const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);
    return { x, y };
  };

  const getTransformedMousePosition = (e) => {
    const { x: mouseX, y: mouseY } = getMousePositionOnCanvas(e);
    // Convert canvas coordinates to image coordinates (considering pan and zoom)
    const imageX = (mouseX - offset.x) / scale;
    const imageY = (mouseY - offset.y) / scale;
    return { x: imageX, y: imageY };
  };


  const handleMouseDown = (e) => {
    if (mode !== "interactive" || !canvasRef.current || e.button !== 0) return; // Only left click
    hasDraggedRef.current = false;
    const { x,y } = getMousePositionOnCanvas(e);
    lastMousePositionRef.current = { x, y };

    // Check if right-click or middle-click for panning (optional, common UX)
    // For now, we'll stick to a mode or a modifier key for panning if explicit point clicking is primary
    // If we want to pan with left click, we need a state to switch between drawing and panning
    // or use a modifier key. For now, we assume any left mousedown starts a potential pan or point.

    // Start panning
    setIsPanning(true);
    setPanStart({
      x: x - offset.x,
      y: y - offset.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isPanning || mode !== "interactive" || !canvasRef.current) return;
    hasDraggedRef.current = true; // If mouse moves while button is down, it's a drag

    const { x: mouseX, y: mouseY } = getMousePositionOnCanvas(e);
    const dx = mouseX - lastMousePositionRef.current.x;
    const dy = mouseY - lastMousePositionRef.current.y;

    setOffset((prevOffset) => ({
      x: prevOffset.x + dx,
      y: prevOffset.y + dy,
    }));

    lastMousePositionRef.current = { x: mouseX, y: mouseY };
  };

  const handleMouseUp = (e) => {
    if (e.button !== 0) return; // Only left click
    setIsPanning(false);

    if (mode === "interactive" && !hasDraggedRef.current && canvasRef.current) {
      // This was a click, not a drag
      const { x, y } = getTransformedMousePosition(e);

      // Ensure points are within image bounds (0 to imageRef.current.width/height)
      if (!imageRef.current || x < 0 || x > imageRef.current.width || y < 0 || y > imageRef.current.height) {
        // Optionally, provide feedback that the click was outside the image bounds after transformation
        // console.warn("Clicked outside image bounds (after transformation)");
        return;
      }

      if (!isDrawing) {
        setPoints([{ x, y }]);
        setIsDrawing(true);
      } else {
        setPoints([...points, { x, y }]);
      }
    }
    // Reset hasDraggedRef for the next interaction
    hasDraggedRef.current = false;
  };

  const handleMouseLeaveCanvas = () => {
    // setIsPanning(false); // Stop panning if mouse leaves canvas
    // hasDraggedRef.current = false; // Also reset drag state
  };

   useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isPanning) {
        setIsPanning(false);
        // hasDraggedRef.current = false; // Reset on global mouse up if needed
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isPanning]);


  const handleWheel = (e) => {
    if (mode !== "interactive" || !canvasRef.current) return;
    e.preventDefault(); // Prevent page scrolling

    const { x: mouseX, y: mouseY } = getMousePositionOnCanvas(e);
    const zoomIntensity = 0.1;
    const delta = e.deltaY > 0 ? -1 : 1; // Standardize wheel direction
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta * zoomIntensity * scale));


    // Calculate the mouse position in the ""world"" (image) coordinates
    const worldX = (mouseX - offset.x) / scale;
    const worldY = (mouseY - offset.y) / scale;

    // New offset to keep the ""world"" point under the mouse
    const newOffsetX = mouseX - worldX * newScale;
    const newOffsetY = mouseY - worldY * newScale;

    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };


  const handleCanvasClick = (e) => {
    // This function is now effectively handled by handleMouseDown/Up and hasDraggedRef logic
    // Kept for now if direct click handling without panning is reinstated for some mode.
    // if (mode !== "interactive" || !canvasRef.current || isPanning) return;
    // const {x, y} = getTransformedMousePosition(e);
    //
    // if (!isDrawing) {
    //   setIsDrawing(true);
    //   setPoints([{ x, y }]);
    // } else {
    //   setPoints([...points, { x, y }]);
    // }
  };


  const handleCanvasDoubleClick = () => {
    if (mode !== "interactive") return
    if (points.length >= 3) {
      setIsDrawing(false)
      calculateArea()
    }
  }

  const handleAddCoordinate = () => {
    const x = Number.parseFloat(coordinateInput.x)
    const y = Number.parseFloat(coordinateInput.y)

    if (isNaN(x) || isNaN(y)) {
      alert("Please enter valid numeric coordinates")
      return
    }

    if (!imageRef.current) return

    // Ensure coordinates are within image bounds
    const imgW = imageRef.current.width
    const imgH = imageRef.current.height

    if (x < 0 || x >= imgW || y < 0 || y >= imgH) {
      alert(`Coordinates must be within image bounds (0-${imgW}, 0-${imgH})`)
      return
    }

    const newPoints = [...points, { x, y }]
    setPoints(newPoints)
    setCoordinateInput({ x: "", y: "" })

    if (!isDrawing && newPoints.length === 1) {
      setIsDrawing(true)
    }
  }

  const handleCompleteShape = () => {
    if (points.length >= 3) {
      setIsDrawing(false)
      calculateArea()
    } else {
      alert("Please add at least 3 points to create a shape")
    }
  }

  const handleDeletePoint = (index) => {
    const newPoints = points.filter((_, i) => i !== index)
    setPoints(newPoints)
    if (newPoints.length < 3) {
      setIsDrawing(true)
      setCurrentSelectionSize({ area: 0 })
    } else if (!isDrawing) {
      // Recalculate area if shape was complete
      setTimeout(calculateArea, 0)
    }
  }

  const handleResetView = () => {
    // Reset only zoom and pan, keep points
    setScale(1)
    setOffset({ x: 0, y: 0 })
    if (canvasRef.current && imageRef.current) {
      drawImage() // Redraw with reset view
    }
  }

  const handleResetSelection = () => {
    // Reset only points and drawing state, keep zoom/pan
    setPoints([])
    setIsDrawing(false)
    setCurrentSelectionSize({ area: 0 })
    setCoordinateInput({ x: "", y: "" })
    if (previewCanvasRef.current) {
      const ctx = previewCanvasRef.current.getContext("2d")
      ctx.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height)
    }
  }

  const handleReset = () => {
    // Reset everything (both view and selection)
    setPoints([])
    setIsDrawing(false)
    setCurrentSelectionSize({ area: 0 })
    setCoordinateInput({ x: "", y: "" })
    setScale(1)
    setOffset({ x: 0, y: 0 })

    if (canvasRef.current && imageRef.current) {
      drawImage()
    }
    if (previewCanvasRef.current) {
      const ctx = previewCanvasRef.current.getContext("2d")
      ctx.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height)
    }
  }

  const handleModeChange = (newMode) => {
    setMode(newMode)
    handleReset() // Reset when switching modes
  }

  // Draw only the selected region in the preview
  useEffect(() => {
    if (!previewCanvasRef.current || !imageRef.current || points.length < 3 || isDrawing) return
    // Find bounding box
    const minX = Math.min(...points.map((p) => p.x))
    const minY = Math.min(...points.map((p) => p.y))
    const maxX = Math.max(...points.map((p) => p.x))
    const maxY = Math.max(...points.map((p) => p.y))
    const width = maxX - minX
    const height = maxY - minY
    // Set preview canvas size
    previewCanvasRef.current.width = width
    previewCanvasRef.current.height = height
    const ctx = previewCanvasRef.current.getContext("2d")
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
    ctx.strokeStyle = "#3B82F6"
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
    const minX = Math.min(...points.map((p) => p.x))
    const minY = Math.min(...points.map((p) => p.y))
    const maxX = Math.max(...points.map((p) => p.x))
    const maxY = Math.max(...points.map((p) => p.y))
    const width = maxX - minX
    const height = maxY - minY

    // Create canvas for the cropped image
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = width
    tempCanvas.height = height
    const tempCtx = tempCanvas.getContext("2d")
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
    const croppedImageUrl = tempCanvas.toDataURL("image/png")

    // Create canvas for the binary mask
    const maskCanvas = document.createElement("canvas")
    maskCanvas.width = width
    maskCanvas.height = height
    const maskCtx = maskCanvas.getContext("2d")
    maskCtx.fillStyle = "black"
    maskCtx.fillRect(0, 0, width, height)
    maskCtx.fillStyle = "white"
    maskCtx.beginPath()
    maskCtx.moveTo(points[0].x - minX, points[0].y - minY)
    for (let i = 1; i < points.length; i++) {
      maskCtx.lineTo(points[i].x - minX, points[i].y - minY)
    }
    maskCtx.closePath()
    maskCtx.fill()
    const maskImageUrl = maskCanvas.toDataURL("image/png")

    onComplete(croppedImageUrl, currentSelectionSize, maskImageUrl)
  }

  const programmaticZoom = (zoomDirection) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasCenterX = canvas.width / 2;
    const canvasCenterY = canvas.height / 2;

    const newScale = zoomDirection === "in"
      ? Math.min(MAX_SCALE, scale * ZOOM_STEP_FACTOR)
      : Math.max(MIN_SCALE, scale / ZOOM_STEP_FACTOR);

    if (newScale === scale) return; // No change if at min/max scale

    // Calculate the canvas center in "world" (image) coordinates before zoom
    const worldX = (canvasCenterX - offset.x) / scale;
    const worldY = (canvasCenterY - offset.y) / scale;

    // New offset to keep the "world" center point at the canvas center
    const newOffsetX = canvasCenterX - worldX * newScale;
    const newOffsetY = canvasCenterY - worldY * newScale;

    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  const handleZoomIn = () => programmaticZoom("in");
  const handleZoomOut = () => programmaticZoom("out");

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Canvas Section */}
      <div className="lg:w-2/3 bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6 border-b pb-4">
          <h2 className="text-xl font-semibold text-gray-800">Select Area to Analyze</h2>
        </div>

        {/* Mode Selection & Instructions */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleModeChange("interactive")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md transition-all ${
                mode === "interactive"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <MousePointer className="h-4 w-4" />
              Interactive Selection
            </button>
            <button
              onClick={() => handleModeChange("coordinate")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md transition-all ${
                mode === "coordinate" ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Edit3 className="h-4 w-4" />
              Coordinate Input
            </button>
            
            {/* Instructions Toggle */}
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center gap-2 px-3 py-2.5 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors ml-auto"
              title="Show/Hide Instructions"
            >
              <Info className="h-4 w-4" />
              <span className="text-sm font-medium">Help</span>
            </button>
          </div>

          {/* Collapsible Instructions */}
          {showInstructions && (
            <div className="p-4 bg-indigo-50 rounded-md border border-indigo-200 text-sm text-indigo-700">
              <p className="font-medium mb-2">Canvas Controls:</p>
              <ul className="list-disc list-inside text-xs space-y-1">
                <li><span className="font-semibold">Scroll</span> to zoom in/out</li>
                <li><span className="font-semibold">Drag</span> to pan the image</li>
                <li><span className="font-semibold">Click</span> to add points, <span className="font-semibold">double-click</span> to complete shape</li>
                <li>Use buttons below for zoom and reset controls</li>
              </ul>
            </div>
          )}
        </div>

        {/* Coordinate Input Section - Only for coordinate mode */}
        {mode === "coordinate" && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Add Coordinate Point</h3>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">X Coordinate</label>
                <input
                  type="number"
                  value={coordinateInput.x}
                  onChange={(e) => setCoordinateInput((prev) => ({ ...prev, x: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter X"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Y Coordinate</label>
                <input
                  type="number"
                  value={coordinateInput.y}
                  onChange={(e) => setCoordinateInput((prev) => ({ ...prev, y: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter Y"
                />
              </div>
              <button
                onClick={handleAddCoordinate}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Point
              </button>
              {mode === "coordinate" && isDrawing && (
                <button
                  onClick={handleCompleteShape}
                  className="px-4 py-2.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors shadow-sm flex items-center gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Complete
                </button>
              )}
            </div>
            {imageRef.current && (
              <div className="mt-2 text-xs text-gray-500">
                Valid range: X (0-{imageRef.current.width}), Y (0-{imageRef.current.height})
              </div>
            )}
          </div>
        )}

        {/* Canvas Controls */}
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-md border-l-4 border-blue-500">
            {mode === "interactive"
              ? "Click to add points and create a shape. Double-click to complete."
              : "Enter coordinates to define your selection area."}
          </div>
          
          {/* Zoom and Reset Controls */}
          <div className="flex gap-1">
            <button
              onClick={handleZoomIn}
              className="p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors shadow-sm"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors shadow-sm"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetView}
              className="p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors shadow-sm"
              title="Reset View (Zoom & Pan)"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetSelection}
              className="px-3 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors shadow-sm text-sm"
              title="Reset Selection (Points)"
            >
              Clear Points
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex justify-center mb-4">
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeaveCanvas}
              onWheel={handleWheel}
              onDoubleClick={handleCanvasDoubleClick}
              className={`max-h-[700px] w-auto ${mode === "interactive" ? (isPanning ? "cursor-grabbing" : "cursor-crosshair") : "cursor-default"}`}
              style={{ touchAction: 'none' }}
            />
          </div>
        </div>

        {/* Reference Info */}
        <div className="flex items-center gap-2 text-sm text-blue-600 justify-center bg-blue-50 py-3 px-4 rounded-md">
          <Ruler className="h-4 w-4" />
          <span>
            Reference object: {formatScientific(deviceWidth)} × {formatScientific(deviceHeight)} sq. meters. Zoom: {scale.toFixed(2)}x
          </span>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="lg:w-1/3 space-y-6">
        {/* Selection Preview */}
        {points.length >= 3 && !isDrawing ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Selection Preview
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-center">
                <div className="border-2 border-blue-500 rounded-lg overflow-hidden p-1 bg-gray-50 shadow-sm">
                  <canvas ref={previewCanvasRef} className="max-w-full h-auto max-h-[200px]" />
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="M2 8h20"></path>
                  </svg>
                  Measurements:
                </h3>
                <div className="bg-white p-3 rounded-md flex justify-between items-center shadow-sm border border-blue-50">
                  <span className="text-gray-700 font-medium">Area:</span>
                  <div
                    data-tooltip-id="area-tooltip"
                    data-tooltip-content={currentSelectionSize.area}
                    className="text-blue-700 font-semibold"
                  >
                    {formatScientific(currentSelectionSize.area)}{" "}
                    <span className="text-gray-500 font-normal">sq. meters</span>
                  </div>
                  <Tooltip id="area-tooltip" place="top" />
                </div>
              </div>
            </div>
            <div className="flex justify-between border-t p-4 bg-gray-50">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={handleContinue}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-400 mb-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Selection Preview</h3>
              <p className="text-gray-500 text-sm">
                {mode === "interactive"
                  ? "Draw a shape in the image to see preview"
                  : "Add coordinates to create selection area"}
              </p>
            </div>
          </div>
        )}

        {/* Points Table - Moved here */}
        {points.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              Selected Points ({points.length})
            </h3>
            <div className="max-h-48 overflow-y-auto rounded-md border border-gray-200">
              <table className="w-full text-sm bg-white">
                <thead className="sticky top-0">
                  <tr className="bg-gray-100">
                    <th className="text-left py-2 px-3 text-gray-600 font-medium">#</th>
                    <th className="text-left py-2 px-3 text-gray-600 font-medium">X</th>
                    <th className="text-left py-2 px-3 text-gray-600 font-medium">Y</th>
                    <th className="text-left py-2 px-3 text-gray-600 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {points.map((point, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-2 px-3 text-gray-800">{index + 1}</td>
                      <td className="py-2 px-3 text-gray-800">{Math.round(point.x)}</td>
                      <td className="py-2 px-3 text-gray-800">{Math.round(point.y)}</td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => handleDeletePoint(index)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                          title="Delete point"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AreaSelection