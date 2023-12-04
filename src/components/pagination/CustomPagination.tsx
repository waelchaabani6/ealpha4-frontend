import Pagination from '@mui/material/Pagination';
import { useState } from 'react';
import './style.scss';

type CustomPagination = {
  currentPage: number | string | any;
  sxClass?: object;
  paginateHandler?: (e: any) => void;
  totalPages: number;
};

const CustomPagination = (props: CustomPagination): JSX.Element => {
  const { currentPage, sxClass, totalPages } = props;
  const [fieldValue, setfieldValue] = useState(1);

  const onTextChange = (e: any) => {
    setfieldValue(e);
  };
  const handleOnBlurr = (e: any) => {
    if (e) {
      if (e > totalPages) {
        setfieldValue(1);
      } else if (props?.paginateHandler) {
        props.paginateHandler(e);
      }
    } else if (props?.paginateHandler) {
      props.paginateHandler(1);
      setfieldValue(1);
    }
  };
  const handleChange = (event: React.ChangeEvent<unknown>, value: string | number) => {
    if (props?.paginateHandler) {
      props.paginateHandler(value);
    }
  };
  return (
    <div className="flex items-center min-w-max">
      <div className="ant-pagination-options-quick-jumper text-sm">
        Page
        <input
          type="number"
          name="jumperField"
          aria-label="Page"
          value={currentPage}
          onChange={(e): any => handleChange(e, e.target.value)}
        // onBlur={(e): any => handleChange(e, Number(e.target.value))}
        />
        of
        <span className="mx-1">{totalPages}</span>
      </div>
      <Pagination
        sx={{
          li: {
            display: 'none',
            button: {
              border: `1px solid var(--accent)`,
              background: 'var(--white)',
              color: 'var(--accent)',
              width: '26px',
              height: '26px'
            }
          },
          'li:first-of-type': {
            display: 'block'
          },
          'li:last-child': {
            display: 'block'
          },
          ...sxClass
        }}
        boundaryCount={0}
        count={totalPages}
        page={currentPage}
        siblingCount={0}
        variant="outlined"
        shape="rounded"
        size="small"
        onChange={handleChange}
      />
    </div>
  );
};

export default CustomPagination;

export const NumberedPagination = (props: CustomPagination): JSX.Element => {
  const { currentPage, sxClass, totalPages } = props;
  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    if (props?.paginateHandler) {
      props.paginateHandler(value);
    }
  };
  return (
    <Pagination
      sx={{
        ul: {
          justifyContent: 'center'
        },
        li: {
          button: {
            border: `1px solid var(--accent)`,
            background: 'var(--white)',
            color: 'var(--accent)'

          },
          '.Mui-selected': {
            backgroundColor: 'var(--accent)',
            color: 'var(--white)'
          },
          '.MuiPaginationItem-page': {
            border: 'none'
          }
        },
        ...sxClass
      }}
      count={totalPages}
      page={currentPage}
      variant="outlined"
      shape="rounded"
      size="small"
      onChange={handleChange}
    />
  );
};
