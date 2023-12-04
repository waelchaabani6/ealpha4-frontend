import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import { Link, useLocation, useParams } from 'react-router-dom';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dropdown from '@component/dropdown/Dropdown';

type StickyHeadTableProps = {
  rows: Array<any>;
  columns: Array<any>;
  onChangeHandler: (arg1?: any, arg2?: any) => void;
  handleClearClick?: () => void;
  fullHeight?: boolean;
}

export default function StickyHeadTable({ rows, columns, onChangeHandler, handleClearClick, fullHeight = false }:StickyHeadTableProps) {
  const location = useLocation();
  const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={fullHeight ? {} : { maxHeight: 440 }}>
        <Table aria-label=" table">
          <TableHead>
            <TableRow>
              {columns.map((column, cIndex) => (column.component === 'Dropdown'
                ? (<TableCell
                    key={column.id}
                    style={{ minWidth: column.minWidth }}
                >
                  <Dropdown
                    dataArray={column.dataArray}
                    onChangeHandler={(val) => onChangeHandler(val, cIndex)}
                    value={column.selectedValue}
                    title=""
                    sxClass={{ width: '80%', position: 'relative', top: '-2px' }}
                    handleClearClick={handleClearClick || (() => {})}
                    showCancel={true}
                    displayEmpty={true}
                    IconParentClass="relative left-[16px]"
                  />
                  {/* eslint-disable-next-line react/jsx-closing-tag-location */}
                </TableCell>
                )
                : (
                  <TableCell
                    key={column.id}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .map((row, ind) => (
                <TableRow hover={true} role="checkbox" tabIndex={-1} key={ind}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      column.id === 'Pages'
                        ? (
                          <TableCell key={column.id}>
                            <Link state={{ ...row?.scormDataView, isDueDatedExceeded: true, pageNumber: row?.pageNumber }} to={`/${schoolNameInURL}/course-preview`}>
                              {' '}
                              <span className="underline cursor-pointer font-medium">{value}</span>
                              {' '}
                            </Link>
                          </TableCell>)
                        : (
                          <TableCell key={column.id}>
                            {value}
                          </TableCell>)
                    );
                  })}
                </TableRow>))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
