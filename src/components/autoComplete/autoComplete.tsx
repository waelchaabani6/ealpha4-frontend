import { ReactComponent as Search } from '@images/search.svg';
import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { useClickAway, useDebounce } from 'react-use';
import { useGet } from '@shared/api/useApi';
import { styled } from '@mui/system';
import Loader from '@shared/loader';
import { Typography, Autocomplete, TextField } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import ClearIcon from '@mui/icons-material/Clear';

type AutoCompleteProps = {
  path: string;
  list: (val: any[]) => JSX.Element[];
  onSelect?: (val: string | any) => void;
  targetKey: string;
  appendSearch: boolean;
}

export default function AutoComplete(props: AutoCompleteProps) {
  const ref = useRef(null);
  const [open, setOpen] = useState<boolean>(false);
  const [value, setvalue] = useState<string>('');
  const [debouncedValue, setDebouncedValue] = useState<string>('');
  const { isLoading, data, refetch, error }: any = useGet({
    url: props.appendSearch ? `${props.path}${value}` : props.path,
    // url: `https://jsonplaceholder.typicode.com/posts/${debouncedValue}/comments`,
    cacheTime: 5000,
    enabled: false
  });
  useEffect(() => {
    if ((data?.response?.results || []).length > 0) {
      props.list(data);
    }
  }, [data]);
  useDebounce(
    () => {
      setDebouncedValue(value);
    },
    500,
    [value]
  );

  useEffect(() => {
    if (debouncedValue !== '') {
      refetch();
    }
  }, [debouncedValue]);

  useClickAway(ref, () => {
    setOpen(false);
  });
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.stopPropagation();
    ev.preventDefault();
    setvalue(ev.target.value);
    setOpen(true);
  };
  const focusHandler = () => {
    if (data?.length > 0) {
      setOpen(true);
    }
  };

  const makeList = useMemo((): JSX.Element[] => props.list(data), [data]);

  const listClick = (ev: React.MouseEvent<HTMLElement>) => {
    const target = ev.target as HTMLLIElement;
    const targetData = JSON.parse(target.getAttribute('data-target') as any);
    if (props.onSelect && targetData) {
      props.onSelect(data[targetData]);
      setvalue(data[targetData][props.targetKey]);
      setDebouncedValue(data[targetData][props.targetKey]);
      setOpen(false);
    }
  };

  const noDataMessage = useMemo(() => {
    setTimeout(() => (
      <div className="h-full w-full text-center py-6 hover:bg-white">No Match</div>
    ), 500, undefined);
    return (
      <li className="h-20 w-full">
        <Loader size={30} />
      </li>
    );
  }, []);

  return (
    <div className="min-w-[250px] h-[36px]">
      <div ref={ref} className="w-full h-full flex flex-col relative">
        <div className="flex-1 flex bg-white border-2 rounded px-0.5">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search"
              className="h-full w-full px-1 outline-none placeholder:text-black text-sm"
              value={value}
              onChange={onChange}
              onFocus={focusHandler}
            />
          </div>
          <div className="w-[32px] h-full grid justify-center place-items-center">
            <Search className="p-px pl-1" />
          </div>
        </div>
        {
          (value !== '' && (error || open)) && (
            <ListStyle
              tabIndex={0}
              onClick={listClick}
            >
              {
                isLoading
                  ? (
                    <li className="h-20 w-full">
                      <Loader size={30} />
                    </li>
                  )
                  : error
                    ? <div className="h-full w-full text-center py-6 text-red-500">Error</div>
                    : ((data?.response?.results || []).length > 0)
                      ? makeList
                      : noDataMessage
              }
            </ListStyle>
          )
        }
      </div>
    </div>
  );
}

export function CustomAutoComplete(props: any) {
  const { isLoading, list, setDebounceValue, targetKey, onSelect, error, required, label, name, disabled, parentClass = '' } = props;
  const ref = useRef(null);
  const [open, setOpen] = useState<boolean>(false);
  const [value, setvalue] = useState<string>('');
  // console.log('-------------', value);
  useDebounce(
    () => {
      setDebounceValue(value);
    },
    500,
    [value]
  );

  useClickAway(ref, () => {
    setOpen(false);
  });
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.stopPropagation();
    ev.preventDefault();
    setvalue(ev.target.value);
    setOpen(true);
  };
  const focusHandler = () => {
    if (list?.length > 0) {
      setOpen(true);
    }
  };
  const noDataMessage = useMemo(() => <div className="h-full w-full text-center py-6 hover:bg-white">No Match</div>, []);

  const makeList = () => {
    if (list.length) {
      return list.length && list.map((item: any, index: number) => (
        <li key={item?.id} data-target={index}>{item[targetKey]}</li>
      ));
    }
    return noDataMessage;
  };

  const listClick = (ev: React.MouseEvent<HTMLElement>) => {
    const target = ev.target as HTMLLIElement;
    const targetData = JSON.parse(target.getAttribute('data-target') as any);
    if (onSelect) {
      onSelect(list[targetData]);
      setvalue(list[targetData][targetKey]);
      setDebounceValue(list[targetData][targetKey]);
      setOpen(false);
    }
  };

  return (
    <div className={`min-w-[250px] h-[36px] ${parentClass}`}>
      <Typography
        className={`capitalize pb-3.5 ${error ? 'text-red-600' : ''}`}
        variant="caption"
        display="block"
      >
        {label}
        {required && (
          <Typography
            className="text-red-600"
            variant="caption"
            display="inline-block"
          >
            &nbsp;*
          </Typography>
        )}
      </Typography>
      <div ref={ref} className="w-full h-full flex flex-col relative">
        <div className="flex-1 flex bg-white border-2 rounded px-0.5">
          <div className="flex-1">
            <input
              name={name}
              type="text"
              placeholder="Search"
              className="h-full w-full px-1 outline-none placeholder:text-black text-sm"
              value={value}
              onChange={onChange}
              onFocus={focusHandler}
              required={required || false}
              disabled={disabled || false}
            />
          </div>
          {
            value !== '' && (
              <div role="button" tabIndex={0} className="clearIconAutoComplete" onClick={() => { setvalue(''); setDebounceValue(''); }}>
                <ClearIcon />
              </div>
            )
          }
          <div className="w-[32px] h-full grid justify-center place-items-center">
            <Search className="p-px pl-1" />
          </div>
        </div>
        {
          (value !== '' && (open)) && (
            <ListStyle
              tabIndex={0}
              onClick={listClick}
            >
              {
                isLoading
                  ? (
                    <li className="h-20 w-full">
                      <Loader size={30} />
                    </li>
                  )
                  : makeList()
              }
            </ListStyle>
          )
        }
        {
          !value && <p id="requiredInMultiselect" className="text-xs text-red-600">required</p>
        }

      </div>
    </div>
  );
}

const MaterialAutoComplete = forwardRef((props: any, ref: any) => {
  const {
    isLoading,
    list,
    setDebounceValue,
    targetKey,
    onSelect,
    error,
    required,
    label,
    name,
    disabled
  } = props;

  const refs = useRef(null);
  const [value, setvalue] = useState<any>('');
  useDebounce(
    () => {
      setDebounceValue(value);
    },
    500,
    [value]
  );

  useEffect(() => {
    if (!list?.length) {
      const element: HTMLElement = document.querySelector('[title="Clear"]') as HTMLElement;
      element?.click();
    }
  }, [list?.length]);

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.stopPropagation();
    ev.preventDefault();
    setvalue(ev.target.value);
  };

  return (
    <div ref={refs} className="w-full h-full flex flex-col relative">
      <div className="flex-1 flex">
        <div className="flex-1">
          <Typography
            className={`capitalize pb-3.5 ${error ? 'text-red-600' : ''}`}
            variant="caption"
            display="block"
          >
            {label}
            {required && (
              <Typography
                className="text-red-600"
                variant="caption"
                display="inline-block"
              >
                &nbsp;*
              </Typography>
            )}
          </Typography>
          <Autocomplete
            id="material_ui_autocomplete"
            disabled={!!disabled}
            ref={refs}
            options={list || []}
            isOptionEqualToValue={(option, val: any) => option[targetKey] === val[targetKey]}
            getOptionLabel={(option) => option[targetKey]}
            className="hasPopupIcon"
            sx={{
              '& .MuiAutocomplete-popupIndicator': { transform: 'none' }
            }}
            popupIcon={<Search />}
            forcePopupIcon={true}
            loading={isLoading}
            onChange={(event, val: any) => {
              onSelect(val || {});
              if (val) {
                setvalue(val[targetKey]);
                setDebounceValue(val[targetKey]);
              } else {
                setvalue('');
                setDebounceValue('');
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                error={!!error}
                name={name}
                value={value}
                helperText={error ? error.message : ''}
                placeholder="Search"
                sx={{
                  '& .MuiAutocomplete-endAdornment': { top: '2px' },
                  '& .MuiAutocomplete-clearIndicator': { marginRight: '4px' }
                }}
                onChange={onChange}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoading ? (
                        <CircularProgress
                          color="inherit"
                          size={20}
                          style={{ marginRight: 8 }}
                        />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
});

export { MaterialAutoComplete };

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
