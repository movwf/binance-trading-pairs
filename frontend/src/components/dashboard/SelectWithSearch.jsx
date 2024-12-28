import { useContext, useEffect, useRef, useState } from "react";
import Fuse from "fuse.js";

import Icons from "../Icons";
import { MarketContext } from "../../contexts/MarketContext";

function SelectWithSearch({ onPairSelected }) {
  const { tradingPairs } = useContext(MarketContext);
  const [isCoinsMenuOpen, showCoins] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const selectRef = useRef(null);

  const fuse = new Fuse(tradingPairs);

  function handleSearch(keyword) {
    if (keyword === "") {
      setSearchResults(tradingPairs.map((p) => ({ item: p })));
    } else {
      if (!isCoinsMenuOpen) {
        showCoins(true);
      }

      const result = fuse.search(keyword);

      setSearchResults(result);
    }
  }

  function handleClickOutside(event) {
    if (selectRef?.current && !selectRef.current?.contains(event.target)) {
      showCoins(false);
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.addEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setSearchResults(tradingPairs.map((p) => ({ item: p })));
  }, [tradingPairs]);

  return (
    <div className="relative h-14 flex justify-between items-center mb-2">
      <div
        ref={selectRef}
        className="relative h-10 w-full bg-gray-600 rounded-lg pr-8 pl-4 cursor-pointer hover:bg-gray-500"
        onClick={() => {
          showCoins(!isCoinsMenuOpen);
        }}
      >
        <input
          type="text"
          className="w-full h-full bg-transparent outline-none"
          onChange={(ev) => {
            handleSearch(ev.target.value);
          }}
        />
        <div className="absolute top-3 right-2 w-4 h-4">
          <Icons.Down />
        </div>
        {isCoinsMenuOpen && (
          <div
            className="absolute h-64 w-full flex flex-col overflow-x-hidden hide-scrollbar z-55 top-12 -left-0 bg-gray-900 border border-gray-600 rounded-lg transition-all"
            onMouseLeave={() => {
              showCoins(false);
            }}
          >
            {searchResults.map((result) => (
              <div
                key={result.item}
                className="border-b border-gray-700"
                onClick={() => {
                  onPairSelected(result.item);
                }}
              >
                <div className="h-16 w-full flex justify-between items-center px-4 hover:bg-gray-700">
                  <div className="flex flex-col">
                    {result.item} <span className="text-gray-500">XXX</span>
                  </div>
                  <div
                    className={`${
                      Math.random(1) > 0.5 ? "text-green-500" : "text-red-500"
                    } flex flex-col items-end`}
                  >
                    $11.111.11{" "}
                    <span className="text-xs">
                      {Math.random(1) > 0.5 ? "" : "-"}0.XX%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SelectWithSearch;
