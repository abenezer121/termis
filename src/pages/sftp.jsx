import React, { useState, useEffect } from "react";
import { FiFolder, FiFile, FiSearch } from "react-icons/fi";

// Import ipcRenderer from Electron
const { ipcRenderer } = window.require("electron");

const SFTPTab = () => {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPath, setCurrentPath] = useState("/home");

  useEffect(() => {
    ipcRenderer.invoke("get-file-system-data", currentPath).then((data) => {
      setFiles(data);
    });
  }, [currentPath]);

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-gray-100 p-4 overflow-y-auto h-full">
        <div className="flex justify-between mb-4">
          <span className="text-sm font-bold">Local</span>
          <div className="relative">
            <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-8 pr-2 py-1 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <nav className="mb-4">
          <ul className="space-y-1">
            <li className="flex items-center text-sm text-gray-500">
              <button onClick={() => setCurrentPath("/home")}> Root </button>
              <span className="ml-2">{currentPath}</span>
            </li>
          </ul>
        </nav>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Name</th>
              <th className="p-2">Date Modified</th>
              <th className="p-2">Size</th>
              <th className="p-2">Kind</th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles.map((file, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td
                  className="p-2 flex items-center cursor-pointer"
                  onClick={() => {
                    if (file.kind === "folder") {
                      setCurrentPath(file.path);
                    }
                  }}
                >
                  {file.kind === "folder" ? (
                    <FiFolder className="mr-2 text-blue-500" />
                  ) : (
                    <FiFile className="mr-2 text-blue-500" />
                  )}
                  {file.name}
                </td>
                <td className="p-2 text-xs">{file.dateModified}</td>
                <td className="p-2 text-xs">{file.size}</td>
                <td className="p-2 text-xs">{file.kind}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cloud and Host Connection */}
      <div className="w-1/2 bg-white p-4 flex flex-col justify-center items-center">
        <h2 className="text-xl font-bold mb-2">Connect to a Host</h2>
        <p className="text-sm text-gray-500 mb-4">
          Select from your saved Hosts
        </p>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          Select host
        </button>
      </div>
    </div>
  );
};

export default SFTPTab;
