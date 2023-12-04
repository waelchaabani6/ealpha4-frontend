import React from 'react';
import MuiSelect, { SelectProps } from '@mui/material/Select';
import { ReactComponent as DropDownArrow } from '@images/down arrow.svg';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { FormControl, MenuItem, Typography, Checkbox } from '@mui/material';
import Loader from '@shared/loader';

interface Props {
  dataarray: { label: string; value: string | number | boolean }[];
  loading?: true | false;
  onChange?: any;
  disabledAll?: boolean | undefined;
  disableplaceholdervalue?: boolean;
  displayEmpty?: any;
  ismultiple?: boolean | undefined;
  value?: any;
  sx?: any;
  parentLabelClass?: string;
  parentIconClass?: string;
  itemStyle?: any;
}

export default React.forwardRef(
  ({ dataarray, ...props }: SelectProps & Props, ref) => {
    let tempArr = [...(dataarray || [])];
    if (props?.disabledAll) {
      tempArr = dataarray?.filter((i: any) => i.value !== 'All');
    }
    const renderValue = (selected: Array<string> | string) => {
      if (
        (selected instanceof Array && selected.length === 0)
        || ((typeof selected === 'string' || selected instanceof String)
          && selected === '')
      ) {
        return <em>Select</em>;
      }
      if (props.ismultiple && selected instanceof Array) {
        return selected.join(', ');
      }
      return selected;
    };

    const renderIcon = () => (
      <span className={`${props.parentIconClass || ''} absolute right-2`}>
        <KeyboardArrowDownIcon />
      </span>
    );

    return (
      <FormControl fullWidth={true}>
        <Typography
          className={`capitalize pb-3.5 ${props.error ? 'text-red-600' : ''} ${props.parentLabelClass || ''}`}
          variant="caption"
          display="block"
        >
          {props.label}
          {props.required && (
            <Typography
              className="text-red-600"
              variant="caption"
              display="inline-block"
            >
              &nbsp;*
            </Typography>
          )}
        </Typography>
        <MuiSelect
          {...props}
          onChange={props?.onChange}
          defaultValue={props?.ismultiple ? [] : ''}
          ref={ref}
          multiple={!!props.ismultiple}
          displayEmpty={props.displayEmpty || false}
          size="small"
          IconComponent={renderIcon}
          sx={{
            '.Mui-disabled': {
              backgroundColor: 'var(--sandgray)',
              borderRadius: '4px',
              borderColor: 'var(---linegray)'
            },
            background: 'white',
            '.MuiSelect-multiple': {
              textTransform: 'capitalize'
            },
            ...(props.sx)
          }}
          {...(props?.ismultiple ? { renderValue } : null)}
        >
          {dataarray?.length > 0 && (
            <MenuItem disabled={props.disableplaceholdervalue} value="" style={props.itemStyle || {}}>
              <em>Select</em>
            </MenuItem>
          )}
          {/* Show message When no data present */}
          {dataarray?.length === 0 && (
            <MenuItem disabled={true}>
              <em>No Data Available</em>
            </MenuItem>
          )}
          {props.loading ? (
            <Loader size={20} />
          ) : (
            (tempArr || []).map(
              (e: any): JSX.Element => (
                <MenuItem
                  disabled={!e?.value}
                  key={e?.value || e}
                  value={e?.value || e}
                  style={props.itemStyle || {}}
                >
                  {props.ismultiple && (
                    <Checkbox checked={props?.value.indexOf(e?.value) > -1} />
                  )}
                  {e?.value ? e?.label || e : <em>{e?.label}</em>}
                </MenuItem>
              )
            )
          )}
        </MuiSelect>
      </FormControl>
    );
  }
);
