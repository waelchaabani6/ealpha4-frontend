import styled from '@emotion/styled';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useClickAway, useDebounce } from 'react-use';
import { ReactComponent as Search } from '@images/search.svg';
import { CircularProgress } from '@mui/material';
import { Control, Controller, ControllerRenderProps, UseFormRegister } from 'react-hook-form';

type AutoCompleteProps = {
  dataArray: { label: string; value: number | string | boolean }[];
  isLoading: boolean | undefined;
  value?: string;
  onChange: (value: string | null) => void;
  onSelect: (value: string) => void;
  disabled?: boolean | undefined;
  name: string;
  control: Control<any>;
}

export default React.forwardRef((props: AutoCompleteProps, refFrom: any) => {
  const ref = useRef(null);
  const [open, setOpen] = useState<boolean>(false);
  const [value, setvalue] = useState<string>(props?.value || '');
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

  useClickAway(ref, () => {
    setOpen(false);
  });

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.stopPropagation();
    ev.preventDefault();
    setvalue(ev.target.value);
    // props.onChange(ev.target.value);
    setOpen(true);
  };
  const focusHandler = () => {
    if (props?.dataArray && props?.dataArray.length > 0) {
      setOpen(true);
    }
  };

  const makeList = useMemo((): JSX.Element[] => props?.dataArray?.map((item: { label: string; value: number | string | boolean }, index: number) => (
    <li key={`autoComplete_${index}_${item.value}`} data-target={item.value} className={value === item.value ? 'bg-gray-400' : ''}>{item.label}</li>
  )), [props.dataArray, value]);

  const listClick = (ev: React.MouseEvent<HTMLElement>) => {
    const target = ev.target as HTMLLIElement;
    const targetData = target.getAttribute('data-target');
    if (targetData) {
      // setvalue(targetData);
      props.onSelect(targetData);
      setOpen(false);
    }
  };
  return (
    <div className="w-full h-[40px] rounded-md border ">
      <div ref={ref} className="w-full h-full flex flex-col relative border-linegray">
        <div className={`h-[40px] flex ${props?.disabled ? 'bg-gray-300' : 'bg-white'}  rounded px-0.5`}>
          <input
            {...props.control?.register(props.name, { shouldUnregister: false })}
            ref={refFrom}
            disabled={props?.disabled}
            type="text"
            placeholder="Search"
            className="h-full w-full px-1 outline-none placeholder:text-black text-sm"
            value={value}
            onChange={onChange}
            onFocus={focusHandler}
          />
          <div className="w-[32px] h-full grid justify-center place-items-center">
            {
              props.isLoading
                ? (
                  <CircularProgress
                    color="success"
                    size={20}
                    style={{ marginRight: 8 }}
                  />
                )
                : <Search className="p-px pl-1" />
            }

          </div>
        </div>
        {
          (open && !props.isLoading) && (
            <ListStyle
              tabIndex={0}
              onClick={listClick}
            >
              {
                (!props.isLoading && props?.dataArray?.length > 0)
                  ? makeList
                  : <div className="h-full w-full text-center py-6 hover:bg-white">No Match</div>
              }
            </ListStyle>
          )
        }
      </div>
    </div>
  );
});
const ListStyle = styled('ul')`
position: absolute;
z-index: 20;
top:32px;
max-height: 224px;
width:100%;
overflow: auto;
margin-top: 8px;
border-radius: 5px;
background-color: white;
box-shadow: 0px 10px 15px rgba(0,0,0,0.1);
li{
  padding: 5px;
  font-weight: 500;
  cursor: pointer;
  &:hover{
    background: lightgray;
  }
}
`;
