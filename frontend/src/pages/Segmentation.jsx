import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { base64ToBlob } from "../utils/imageUtils";
import ImageUploader from "../components_v2/ImageUploader";
import DeviceMeasurement from "../components_v2/DeviceMeasurement";
import AreaSelection from "../components_v2/AreaSelection";
import ColorMapConfiguration from "../components_v2/ColorMapConfiguration";
import SharedProgressHeader from "../components_v2/ProgressHeader";
import ResultPage from "./ResultPage";
import { convertToNumber } from "../utils/helperFunctions";
import colorMapImageDefault from "../assets/color_map_crop.jpg";

const Segmentation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState("upload");
  const [isLoading, setIsLoading] = useState(false);

  // Original image state
  const [image, setImage] = useState(null);

  // Device measurement state
  const [deviceImage, setDeviceImage] = useState(null);
  const [deviceWidth, setDeviceWidth] = useState("");
  const [deviceHeight, setDeviceHeight] = useState("");
  const [pixelToUnitRatio, setPixelToUnitRatio] = useState(null);

  // Area selection state
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [maskImageUrl, setMaskImageUrl] = useState(null);
  const [currentSelectionSize, setCurrentSelectionSize] = useState({
    area: 0,
  });

  // Color map state
  const [topValue, setTopValue] = useState("");
  const [bottomValue, setBottomValue] = useState("");
  const [colorMapSource, setColorMapSource] = useState("sentaurus");
  const [customColorMapImage, setCustomColorMapImage] = useState(null);
  
  // Result data state
  const [resultData, setResultData] = useState(null);

  // Step tracking for navigation permissions
  const [completedSteps, setCompletedSteps] = useState({
    upload: true, // Always accessible
    device: false,
    area: false,
    colormap: false,
    results: false,
  });

  // Check if returning from results page with a specific step
  useEffect(() => {
    if (location.state?.returnToStep) {
      setActiveStep(location.state.returnToStep);
      if (location.state.completedSteps) {
        setCompletedSteps(location.state.completedSteps);
      }
    }
  }, [location.state]);

  useEffect(() => {
    console.log("Segmentation component mounted");
    // Log the backend URL
    console.log("Backend URL:", window.BACKEND_URL);
    
    if (!window.BACKEND_URL) {
      console.warn("Backend URL not found, redirecting to home");
      navigate("/");
    }
  }, [navigate]);

  // Navigation handler for progress bar
  const handleStepNavigation = (step) => {
    // Only allow navigation to steps that have been completed
    if (completedSteps[step]) {
      setActiveStep(step);
    }
  };

  // Handle initial image upload
  const handleImageChange = (imageDataUrl) => {
    console.log("Image uploaded");
    setImage(imageDataUrl);
    setCroppedImageUrl(null);
    setMaskImageUrl(null);
    setDeviceImage(null);
    setDeviceWidth("");
    setDeviceHeight("");
    setPixelToUnitRatio(null);
    setActiveStep("device");
    setCompletedSteps({
      ...completedSteps,
      device: true,
    });
  };

  // Handle device measurement completion
  const handleDeviceMeasurementComplete = (deviceImageUrl, width, height, ratio) => {
    setDeviceImage(deviceImageUrl);
    setDeviceWidth(width);
    setDeviceHeight(height);
    setPixelToUnitRatio(ratio);
    setActiveStep("area");
    setCompletedSteps({
      ...completedSteps,
      area: true,
    });
  };

  // Handle area selection completion
  const handleAreaSelectionComplete = (croppedUrl, selectionSize, maskUrl) => {
    setCroppedImageUrl(croppedUrl);
    setMaskImageUrl(maskUrl);
    setCurrentSelectionSize(selectionSize);
    setActiveStep("colormap");
    setCompletedSteps({
      ...completedSteps,
      colormap: true,
    });
  };

  // Handle reset
  const handleReset = () => {
    setImage(null);
    setCroppedImageUrl(null);
    setMaskImageUrl(null);
    setDeviceImage(null);
    setDeviceWidth("");
    setDeviceHeight("");
    setPixelToUnitRatio(null);
    setTopValue("");
    setBottomValue("");
    setColorMapSource("sentaurus");
    setCustomColorMapImage(null);
    setCurrentSelectionSize({ area: 0 });
    setResultData(null);
    setActiveStep("upload");
    setCompletedSteps({
      upload: true,
      device: false,
      area: false,
      colormap: false,
      results: false,
    });
  };

  // Handle calculation
  const handleCalculateAverage = async () => {
    // Validation
    if (!topValue || !bottomValue) {
      alert("Please fill both top and bottom values.");
      return;
    }
    const top = convertToNumber(topValue);
    const bottom = convertToNumber(bottomValue);
    if (top <= bottom) {
      alert("Top value must be greater than bottom value.");
      return;
    }
    if (!croppedImageUrl || !maskImageUrl) {
      alert("Please crop an image first.");
      return;
    }
    if (colorMapSource === "other" && !customColorMapImage) {
      alert("Please upload a color map image.");
      return;
    }
    
    setIsLoading(true);
    try {
      const imageBlob = await base64ToBlob(croppedImageUrl);
      const maskBlob = await base64ToBlob(maskImageUrl);

      const formData = new FormData();
      formData.append("image", imageBlob, "cropped-image.png");
      formData.append("mask", maskBlob, "mask.png");
      formData.append("topValue", top);
      formData.append("bottomValue", bottom);
      formData.append("colorMapSource", colorMapSource);
      
      // Add custom color map file if "other" is selected
      if (colorMapSource === "other" && customColorMapImage?.file) {
        formData.append("colorMap", customColorMapImage.file);
      }
      
      // Add measurement dimensions if available
      if (currentSelectionSize.area > 0) {
        formData.append("selectionArea", currentSelectionSize.area.toString());
      }

      const backendUrl = window.BACKEND_URL || "http://127.0.0.1:5001";

      const response = await axios.post(`${backendUrl}/calculate-average`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Determine color map image URL
      let colorMapImageUrl = null;
      if (colorMapSource === "sentaurus") {
        // Use default Sentaurus color map
        colorMapImageUrl = colorMapImageDefault;
      } else if (colorMapSource === "other" && customColorMapImage?.dataUrl) {
        // Use custom uploaded color map
        colorMapImageUrl = customColorMapImage.dataUrl;
      }

      // Save result data to state instead of navigating
      setResultData({
        average: response.data.average,
        segmentedImage: croppedImageUrl,
        graphImageUrl: response.data.graphImageUrl,
        colorMapData: response.data.colorMapData,
        stats: response.data.stats,
        measurements: currentSelectionSize,
        colorMapImage: colorMapImageUrl,
        colorMapSource: colorMapSource
      });

      // Update completedSteps to include results
      const updatedCompletedSteps = {
        ...completedSteps,
        results: true,
      };
      
      setCompletedSteps(updatedCompletedSteps);
      setActiveStep("results");
    } catch (error) {
      alert("Error calculating average. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Render the appropriate step based on activeStep
  const renderStep = () => {
    switch (activeStep) {
      case "upload":
        return <ImageUploader onImageUpload={handleImageChange} />;
      case "device":
        return image ? (
          <DeviceMeasurement image={image} onComplete={handleDeviceMeasurementComplete} onCancel={handleReset} />
        ) : null;
      case "area":
        return deviceImage ? (
          <AreaSelection
            image={deviceImage}
            deviceWidth={deviceWidth}
            deviceHeight={deviceHeight}
            onComplete={handleAreaSelectionComplete}
            onBack={() => {
              setActiveStep("device");
            }}
          />
        ) : null;
      case "colormap":
        return croppedImageUrl ? (
          <ColorMapConfiguration
            croppedImageUrl={croppedImageUrl}
            deviceImage={deviceImage}
            deviceWidth={deviceWidth}
            deviceHeight={deviceHeight}
            currentSelectionSize={currentSelectionSize}
            topValue={topValue}
            bottomValue={bottomValue}
            onTopValueChange={setTopValue}
            onBottomValueChange={setBottomValue}
            onCalculate={handleCalculateAverage}
            onBack={() => {
              setActiveStep("area");
            }}
            isLoading={isLoading}
            colorMapSource={colorMapSource}
            onColorMapSourceChange={setColorMapSource}
            customColorMapImage={customColorMapImage}
            onCustomColorMapChange={setCustomColorMapImage}
          />
        ) : null;
      case "results":
        return resultData ? (
          <ResultPage 
            average={resultData.average}
            segmentedImage={resultData.segmentedImage}
            graphImageUrl={resultData.graphImageUrl}
            colorMapData={resultData.colorMapData}
            stats={resultData.stats}
            measurements={resultData.measurements}
            colorMapImage={resultData.colorMapImage}
            colorMapSource={resultData.colorMapSource}
            onBack={() => {
              setActiveStep("colormap");
            }}
          />
        ) : null;
      default:
        return <ImageUploader onImageUpload={handleImageChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Use shared header component */}
      <SharedProgressHeader
        activeStep={activeStep}
        completedSteps={completedSteps}
        onStepClick={handleStepNavigation}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{renderStep()}</main>
    </div>
  );
};

export default Segmentation;