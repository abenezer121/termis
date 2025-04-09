import React, { useState } from "react";
const { ipcRenderer } = window.require("electron");

const ExportCollectionModal = ({ isOpen, onClose, name, id }) => {
  const [exportPath, setExportPath] = useState("");
  const [response, setResponse] = useState("");

  if (!isOpen) return null;

  const exportButton = async () => {
    try {
      const result = await ipcRenderer.invoke(
        "export-group",
        id,
        name,
        exportPath,
      );
      setResponse("Exported");
    } catch (error) {
      setResponse("Failed to export try again");
      console.error("Error selecting folder:", error);
    }
  };

  const handleSelectFolder = async () => {
    try {
      const result = await ipcRenderer.invoke("open-folder-dialog");

      if (!result.canceled) {
        setExportPath(result);
      }
    } catch (error) {
      console.error("Error selecting folder:", error);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 transition-all duration-300">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[400px] max-w-[90%]">
        <p
          className={
            response == "Exported"
              ? "text-lg font-semibold text-green-800"
              : "text-lg font-semibold text-red-800"
          }
        >
          {response}
        </p>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Export collection</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">
            <strong>{name}</strong> will be exported as a JSON file.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select export folder:
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={handleSelectFolder}
                className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none"
              >
                Browse
              </button>
              <p className="ml-[2%]">{exportPath}</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium mr-2"
            >
              Cancel
            </button>
            <button
              type="button"
              className="bg-orange-500 text-white px-4 py-2 rounded-md font-medium hover:bg-orange-600 focus:outline-none"
              disabled={!exportPath}
              onClick={exportButton}
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportCollectionModal;
