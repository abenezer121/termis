import React, { useContext } from "react";
import GroupPage from "./groups";
import ServersTab from "./servers";
import SFTPTab from "./sftp";
import SCPTab from ".//scp";
import IdentitiesTab from "./identities";
import TerminalManager from "../component/Terminal/terminalmanager";
import { TermisContext } from "../context/context";
import Iad from "./Iad";
const MainContentSection = () => {
  const { currentDisplay } = useContext(TermisContext);

  return (
    <div
      className={currentDisplay.page == "terminal" ? "flex-1" : "flex-1 p-4"}
    >
      <div
        style={{
          display: currentDisplay.page === "servers" ? "block" : "none",
        }}
      >
        <ServersTab />
      </div>

      <div
        style={{ display: currentDisplay.page === "sftp" ? "block" : "none" }}
      >
        <SFTPTab />
      </div>

      <div
        style={{ display: currentDisplay.page === "scp" ? "block" : "none" }}
      >
        <SCPTab />
      </div>

      <div
        style={{
          display: currentDisplay.page === "identities" ? "block" : "none",
        }}
      >
        <IdentitiesTab />
      </div>

      <div
        style={{ display: currentDisplay.page === "group" ? "block" : "none" }}
      >
        <GroupPage />
      </div>

      <div
        style={{ display: currentDisplay.page === "iad" ? "block" : "none" }}
      >
        <Iad />
      </div>

      <div
        style={{
          display: currentDisplay.page === "terminal" ? "block" : "none",
        }}
      >
        <TerminalManager />
      </div>
    </div>
  );
};

export default MainContentSection;
