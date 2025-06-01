import { useState, useRef } from "react";
import { Upload, ImageIcon } from "./icons";

const ImageUploader = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onImageUpload(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg overflow-hidden">
        <div
          className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg transition-colors ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="mb-6 p-4 bg-blue-50 rounded-full">
            <ImageIcon className="h-12 w-12 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Upload an Image(Color-mapped Profile)
          </h2>
          <p className="text-gray-500 text-center mb-6 max-w-md">
            Drag and drop your image here, or click the button below to select a
            file from your computer.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Upload className="h-4 w-4" />
            Select Image
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>
      <div className="mt-8 max-w-md">
        <h3 className="text-lg font-medium text-gray-700 mb-2 text-center">How It Works</h3>

        <ul className="text-gray-600 space-y-1 pl-5 list-disc">
          <li>Upload an image with appropriate resolution&#91;Refer to manual for details&#93;</li>
          <li>Crop a device/object of interest and provide its dimensions.</li>
          <li>Crop a region of interest.</li>
          <li>Set color map values to calculate segmentation results.</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUploader;
