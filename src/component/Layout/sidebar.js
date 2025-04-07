import React, { useContext } from "react";
import { Tabs } from "./tabs";
import { FiServer, FiKey } from "react-icons/fi";
import { TermisContext } from "../../context/context";
import MainContentSection from "../../pages/maincontent";

const Sidebar = () => {
  const { currentDisplay, setCurrentDisplay } = useContext(TermisContext);

  return (
    <div className="flex h-screen text-gray-800 overflow-hidden">
      <div className="w-64 flex flex-col border-r border-gray-300 bg-gray-100">
        <div className="p-4 border-b border-gray-300">
          <h1 className="text-xl font-bold text-blue-500">Termis</h1>
        </div>

        <div className="mt-4 overflow-y-auto">
          <div
            className={`px-4 py-2 cursor-pointer hover:bg-gray-200 ${
              currentDisplay === "servers" ? "bg-gray-200" : ""
            }`}
            onClick={() =>
              setCurrentDisplay({ page: "servers", identifier: "servers" })
            }
          >
            <div className="flex items-center">
              <FiServer size={16} className="mr-2" />
              <span className="font-medium">Servers</span>
            </div>
          </div>
          <div
            className={`px-4 py-2 cursor-pointer hover:bg-gray-200 ${
              currentDisplay === "sftp" ? "bg-gray-200" : ""
            }`}
            onClick={() =>
              setCurrentDisplay({ page: "sftp", identifier: "sftp" })
            }
          >
            <div className="flex items-center">
              <FiServer size={16} className="mr-2" />
              <span className="font-medium">SFTP</span>
            </div>
          </div>
          <div
            className={`px-4 py-2 cursor-pointer hover:bg-gray-200 ${
              currentDisplay === "scp" ? "bg-gray-200" : ""
            }`}
            onClick={() =>
              setCurrentDisplay({ page: "scp", identifier: "scp" })
            }
          >
            <div className="flex items-center">
              <FiServer size={16} className="mr-2" />
              <span className="font-medium">SCP</span>
            </div>
          </div>
          <div
            className={`px-4 py-2 cursor-pointer hover:bg-gray-200 ${
              currentDisplay === "identities" ? "bg-gray-200" : ""
            }`}
            onClick={() =>
              setCurrentDisplay({
                page: "identifier",
                identifier: "identities",
              })
            }
          >
            <div className="flex items-center">
              <FiKey size={16} className="mr-2" />
              <span className="font-medium">Identities</span>
            </div>
          </div>

          <div
            className={`px-4 py-2 cursor-pointer hover:bg-gray-200 ${
              currentDisplay === "identities" ? "bg-gray-200" : ""
            }`}
            onClick={() =>
              setCurrentDisplay({
                page: "iad",
                identifier: "iad",
              })
            }
          >
            <div className="flex items-center">
              <FiKey size={16} className="mr-2" />
              <span className="font-medium">Iad</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
        <Tabs />
        <MainContentSection />
      </div>
    </div>
  );
};

export default Sidebar;
