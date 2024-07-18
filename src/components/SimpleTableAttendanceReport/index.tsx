import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import { NumberedPagination } from '@component/pagination/CustomPagination';
import { ReactComponent as VectorLeft } from '@images/VectorLeft.svg';
import { ReactComponent as VectorRight } from '@images/VectorRight.svg';
import { ReactComponent as Cancel } from '@images/cancel.svg';
import Dropdown from '@component/dropdown/Dropdown';
import { RESULTS_PER_PAGE } from '@constants/constants';
import { LinearProgress } from '@mui/material';

type StickyHeadTableProps = {
  rows: Array<any>;
  columns: Array<any>;
  totalPages: number;
  paginateHandler?: (e: any) => void;
  rowsPerPageHandler?: (val: number | 'all') => void;
  currentPage?: number | string | any;
  clickLeft?: () => void;
  clickRight?: () => void;
  recordsPerPage?: number | 'all';
  isNext?: boolean;
  isPrev?: boolean;
  isLoading?: boolean;
  sortBy?: 'Present' | 'Absent' | 'All';
};

StickyHeadTable.defaultProps = {
  isNext: false,
  isPrev: false,
  isLoading: false,
  sortBy: 'All',
};

export default function StickyHeadTable({
  sortBy,
  isLoading,
  isNext,
  isPrev,
  rows,
  rowsPerPageHandler,
  recordsPerPage,
  columns,
  totalPages,
  paginateHandler,
  currentPage,
  clickLeft,
  clickRight,
}: StickyHeadTableProps) {
  const newLocal = 'AttendanceReport';
  const showCheckBox = (ele: any) => {
    switch (ele) {
      case 'Checked':
        return sortBy !== 'Absent' ? (
          <div className="h-5 w-5 grid place-items-center relative">
            <Checkbox
              disableRipple={true}
              checked={true}
              color="success"
              sx={{
                cursor: 'default',
                position: 'absolute',
                top: '-10.5px',
                left: '-10.5px',
              }}
            />
          </div>
        ) : (
          '-'
        );
      case 'UnChecked':
        return sortBy !== 'Present' ? (
          <div className="bg-red-500 flex justify-center items-center h-5 w-5 rounded">
            <Cancel />
          </div>
        ) : (
          '-'
        );
      case 'HoliDay':
        return sortBy !== 'Present' ? (
          <div className="flex justify-center items-center font-bold rounded">
            Holiday
          </div>
        ) : (
          '-'
        );
      default:
        return (
          <div className="flex justify-center items-center font-bold rounded">
            Weekend
          </div>
        );
    }
  };
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        {isLoading && <LinearProgress color="success" />}
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table aria-label=" table">
            <TableHead>
              <TableRow>
                {columns.map((column) =>
                  column.id !== newLocal ? (
                    <TableCell
                      key={column.id}
                      style={{
                        minWidth: column.minWidth,
                        textAlign: 'center',
                        backgroundColor: '#E5F8E2',
                      }}
                    >
                      {column.label}
                      {/* eslint-disable-next-line react/jsx-closing-tag-location */}
                    </TableCell>
                  ) : (
                    column.label.map(
                      (
                        ele:
                          | string
                          | number
                          | boolean
                          | React.ReactElement<
                              any,
                              string | React.JSXElementConstructor<any>
                            >
                          | React.ReactFragment
                          | React.ReactPortal
                          | null
                          | undefined,
                        index: number,
                        array: Array<any>
                      ) => (
                        <TableCell
                          style={{ textAlign: 'center' }}
                          className="relative w-4 h-4 bg-[#E5F8E2]"
                        >
                          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                          {isPrev && (
                            <div
                              className={
                                index === 0 ? 'overflow-hidden' : 'hidden'
                              }
                              onClick={clickLeft}
                            >
                              <VectorLeft
                                height={15}
                                width={15}
                                className="cursor-pointer absolute left-[-20px] top-[36%]"
                              />
                            </div>
                          )}
                          {ele}
                          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                          {isNext && (
                            <div
                              className={
                                array.length - 1 === index
                                  ? 'overflow-hidden'
                                  : 'hidden'
                              }
                              onClick={clickRight}
                            >
                              <VectorRight
                                height={15}
                                width={15}
                                className="cursor-pointer absolute left-[70px] top-[36%]"
                              />
                            </div>
                          )}
                          {/* eslint-disable-next-line react/jsx-closing-tag-location */}
                        </TableCell>
                      )
                    )
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length ? (
                rows?.map((row, ind) => (
                  <TableRow
                    hover={true}
                    role="checkbox"
                    tabIndex={-1}
                    key={ind}
                  >
                    {columns.map((column) => {
                      const value = row[column.id];
                      if (column.id === newLocal) {
                        return value.map(
                          (
                            ele:
                              | string
                              | number
                              | boolean
                              | React.ReactElement<
                                  any,
                                  string | React.JSXElementConstructor<any>
                                >
                              | React.ReactFragment
                              | React.ReactPortal
                              | null
                              | undefined
                          ) => (
                            <TableCell
                              style={
                                ele === 'Weekend'
                                  ? {
                                      backgroundColor: '#D2D2D2',
                                      textAlign: 'center',
                                    }
                                  : { textAlign: 'center' }
                              }
                            >
                              {showCheckBox(ele)}
                              {/* eslint-disable-next-line react/jsx-closing-tag-location */}
                            </TableCell>
                          )
                        );
                      }
                      return (
                        <TableCell
                          key={column.id}
                          style={{ textAlign: 'center' }}
                        >
                          {value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={13} align="center">
                    <p>No data found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      {totalPages > 10 && (
        <div className="my-5 px-4 flex items-center justify-between">
          <div className="flex gap-x-1 items-center justify-center">
            <p className="text-xs pt-2">Display</p>
            <Dropdown
              // title="Select Branch"
              value={recordsPerPage}
              sxClass={{
                width: '70px',
                height: '30px',
                border: '2px solid #D2D2D2',
              }}
              dataArray={RESULTS_PER_PAGE}
              onChangeHandler={rowsPerPageHandler as any}
            />
            <p className="text-xs pt-2">Entries</p>
          </div>
          {totalPages && totalPages > 1 ? (
            <NumberedPagination
              totalPages={totalPages}
              paginateHandler={paginateHandler}
              currentPage={currentPage}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
