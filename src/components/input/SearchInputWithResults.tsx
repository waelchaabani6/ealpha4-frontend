import React, { useEffect, useImperativeHandle, useState } from "react";
import { ReactComponent as Search } from "@images/search.svg";
import { useDebounce } from "react-use";
import ClearIcon from "@mui/icons-material/Clear";
import { CircularProgress } from "@mui/material";

type Props<T> = {
  onChange: (value: string) => void;
  loading?: boolean;
  results?: T[]; // Generic results array
  renderResultItem: (item: T, index: number) => React.ReactNode; // Render function for each result
  onResultSelect?: (item: T) => void; // Callback when a result is selected
};

export default React.forwardRef(<T,>(props: Props<T>, ref: any) => {
  const [value, setValue] = useState<string>("");
  const [debouncedValue, setDebouncedValue] = useState<string>("");

  useDebounce(
    () => {
      setDebouncedValue(value);
    },
    500,
    [value]
  );

  useEffect(() => {
    props.onChange(debouncedValue);
  }, [debouncedValue]);

  useImperativeHandle(ref, () => ({
    reset() {
      setValue("");
    },
  }));

  const reset = () => {
    setValue("");
    setDebouncedValue("");
  };

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.stopPropagation();
    ev.preventDefault();
    setValue(ev.target.value);
  };

  const handleResultSelect = (item: T) => {
    if (props.onResultSelect) {
      props.onResultSelect(item);
    }
    // Clear the input and close the results dropdown
    setValue("");
    setDebouncedValue("");
  };

  return (
    <div className="min-w-[200px] h-[36px]">
      <div className="w-full h-full flex flex-col relative">
        <div className="flex-1 flex bg-white border-2 rounded px-0.5">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search"
              className="h-full w-full px-1 outline-none placeholder:text-black text-sm"
              value={value}
              onChange={onChange}
            />
          </div>
          <div className="flex items-center gap-[5px] justify-end">
            {props?.loading ? (
              <CircularProgress color="success" size={20} />
            ) : (
              value && (
                <span
                  aria-label="Clear search"
                  role="button"
                  tabIndex={0}
                  onClick={reset}
                >
                  <ClearIcon />
                </span>
              )
            )}
            <Search className="w-[26px]" />
          </div>
        </div>
        {/* Render search results */}
        {value && props.results && props.results.length > 0 && (
          <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded shadow-lg z-10">
            <ul className="divide-y divide-gray-200">
              {props.results.map((item, index) => (
                <li
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleResultSelect(item)}
                >
                  {props.renderResultItem(item, index)}
                </li>
              ))}
            </ul>
          </div>
        )}
        {value && props.results && props.results.length === 0 && (
          <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded shadow-lg z-10 p-2 text-sm text-gray-500">
            No results found
          </div>
        )}
      </div>
    </div>
  );
});
