import React, { useEffect, useImperativeHandle, useState } from 'react';
import { ReactComponent as Search } from '@images/search.svg';
import { useDebounce } from 'react-use';
import ClearIcon from '@mui/icons-material/Clear';
import { CircularProgress } from '@mui/material';

type Props = {
  onChange: (value: string) => void;
  loading?: boolean;
}

export default React.forwardRef((props: Props, ref: any) => {
  const [value, setvalue] = useState<string>('');
  const [debouncedValue, setDebouncedValue] = useState<string>('');

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

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.stopPropagation();
    ev.preventDefault();
    setvalue(ev.target.value);
  };

  useImperativeHandle(ref, () => ({
    reset() {
      setvalue('');
    }
  }));

  const reset = () => {
    setvalue('');
    setDebouncedValue('');
  };

  return (
    <div className="min-w-[250px] h-[36px]">
      <div
        className="w-full h-full flex flex-col relative"
      >
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
            {
              props?.loading
                ? <CircularProgress color="success" size={20} />
                : value && <span aria-label="Mute volume" role="button" tabIndex={0} onClick={reset}><ClearIcon /></span>
            }
            <Search className="w-[26px]" />
          </div>
        </div>
      </div>
    </div>
  );
});
