import React, { useContext, useState } from "react";
import { TermisContext } from "../context/context";
import Search from "../component/Search/search";
import Hosts from "../component/Host/hosts";

const GroupPage = () => {
  const { view, removeLastIndexFromView, setCurrentDisplay, currentDisplay } =
    useContext(TermisContext);

  let removeFromViewsArray = (index) => {
    if (index !== view.length - 1) {
      removeLastIndexFromView();

      setCurrentDisplay({
        page: view[view.length - 2],
        identifier: view[view.length - 2],
      });
    }
  };

  return (
    <div className="mb-[5%]">
      {view.map((item, index) => (
        <React.Fragment key={index}>
          <span
            onClick={() => removeFromViewsArray(index)}
            className="cursor-pointer mx-3 text-blue-600 font-medium transition-colors duration-300 ease-in-out hover:text-blue-800"
          >
            {item}
          </span>

          {index < view.length - 1 && (
            <span className="mx-3 text-lg text-gray-500 font-semibold">→</span>
          )}
        </React.Fragment>
      ))}

      <div className="mt-4">
        <Search />
      </div>

      <div className="mt-4">
        <Hosts parentId={currentDisplay.parentId} />
      </div>
    </div>
  );
};

export default GroupPage;
