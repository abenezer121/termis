import React, { useContext, useState, useEffect } from "react";
import { TermisContext } from "../../context/context";
import XtermTerminal from "../Terminal/terminal";
import { FaUbuntu, FaWindows } from "react-icons/fa";

const Hosts = () => {
  const { searchQuery, addNewTab, hosts, setCurrentDisplay } =
    useContext(TermisContext);

  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setColumns(1);
      } else if (width < 768) {
        setColumns(2);
      } else {
        setColumns(3);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredHosts = hosts.filter((host) =>
    host.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const gridClass = `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${columns} gap-4`;

  return (
    <div className="">
      <h3 className="text-lg font-semibold mb-4">Hosts</h3>
      <div className={gridClass}>
        {filteredHosts.map((host) => (
          <div
            onClick={() => {
              addNewTab(
                host.name,
                host.id,
                "terminal",
                host.host,
                host.username,
                host.privateKey,
                host.port,
                <XtermTerminal
                  id = {host.id}
                  host={host.host}
                  privateKey={host.privateKey}
                  username={host.username}
                  port={host.port}
                />,
              );
              setCurrentDisplay({ page: "terminal", identifier: host.id });
            }}
            key={host.id}
            className="bg-white rounded-md  p-3 flex items-center space-x-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            {host.osType === "windows" ? <FaWindows /> : <FaUbuntu />}
            <div className="min-w-0">
              <p className="font-bold text-gray-800 truncate">{host.name}</p>
              <span className="text-sm text-gray-500 truncate block">
                {host.connectionDetails}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hosts;
