
import React , {useContext} from "react";
import { TermisContext } from "../../context/context";

const TerminalManager = () => {
    const { activeTabId, tabs } = useContext(TermisContext);
  
    return (
      <div className="flex-1">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            style={{ display: tab.id === activeTabId ? "block" : "none" }}
          >
            {tab.content}
          </div>
        ))}
      </div>
    );
  };

  export default TerminalManager