import { useState, useContext, useEffect } from "react";
import { TermisProvider, TermisContext } from "./context/context";

import Sidebar from "./component/Layout/sidebar";
const { ipcRenderer } = window.require("electron");
function App() {
  const { setHosts, setGroups } = useContext(TermisContext);
  useEffect(() => {
    ipcRenderer.invoke("get-system-data").then((data) => {
      if (data.hosts != undefined) setHosts(data.hosts);

      if (data.groups != undefined) setGroups(data.groups);
    });
  }, []);

  return <Sidebar />;
}

export default App;
