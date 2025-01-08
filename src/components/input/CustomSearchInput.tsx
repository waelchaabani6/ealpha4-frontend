/* eslint-disable comma-dangle */
import React from 'react';
import { ReactComponent as Search } from '@images/search.svg';

import { CircularProgress } from '@mui/material';
import { Control, Controller } from 'react-hook-form';

type Props = {
  loading?: boolean;
  control: Control<any, any>;
  name: string;
};

export default React.forwardRef((props: Props) => {
  const i = 0;

  return (
    <div className="min-w-full h-[36px]">
      <div className="w-full h-full flex flex-col relative">
        <div className="flex-1 flex bg-white border-2 rounded px-0.5">
          <div className="flex-1">
            <Controller
              control={props.control}
              name={props.name}
              defaultValue=""
              render={({ field: { onChange, value } }) => (
                <input
                  type="text"
                  placeholder="Search"
                  className="h-full w-full px-1 outline-none placeholder:text-black text-sm"
                  value={value}
                  onChange={onChange}
                />
              )}
            />
          </div>
          <div className="flex items-center gap-[5px] justify-end">
            {props?.loading && <CircularProgress color="success" size={20} />}
            {/* <Search className="w-[26px]" /> */}
          </div>
        </div>
      </div>
    </div>
  );
});
