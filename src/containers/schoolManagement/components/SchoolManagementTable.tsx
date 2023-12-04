/* eslint-disable no-console */
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { useState, useEffect } from 'react';
import TableSortLabel from '@mui/material/TableSortLabel';
import { COMPONENTS } from '@constants/constants';
import CustomCheckbox from '../../../components/checkbox/CustomCheckbox';
import { NumberedPagination } from '../../../components/pagination/CustomPagination';
import CustomizedSwitches from '../../../components/switch/CustomSwitch';
import LongMenu from '../../../components/IconMenu/CustomIconMenu';
import Row from '../../../components/AdvancedTable/Row';

type SchoolManagementTable = {
  tableData: any;
  currentPage?: number | string | any;
  paginateHandler?: (e: any) => void | undefined;
  totalPages?: number;
  rowsPerPage?: string | number;
  handleMoreOption?: (id: any, rowData: any) => void;
  moreMenuOptions?: [] | any;
  headerRows: any;
  subTableHeader?: any;
  bulkSelect?: any;
  setBulkSelect?: any;
  orderBy?: any;
  setOrderBy: any;
  order?: any;
  setOrder?: any;
  statusHandler?: any;
};
const SchoolManagementTable = (props: SchoolManagementTable): JSX.Element => {
  const {
    tableData,
    currentPage,
    paginateHandler = () => { },
    totalPages,
    rowsPerPage,
    handleMoreOption,
    moreMenuOptions,
    headerRows,
    subTableHeader,
    bulkSelect,
    setBulkSelect,
    order,
    setOrder,
    orderBy,
    setOrderBy,
    statusHandler
  } = props;

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: any
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const createSortHandler = (e: any, item: any): any => {
    // console.log(e, item);
    handleRequestSort(e, item);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>, data: any, selector?: string): any => {
    let newSchoolID: string | any[] = [];
    newSchoolID = data.map((n: any) => n[selector || 'id']);

    if (event) {
      const newDat = [...bulkSelect, ...newSchoolID];
      setBulkSelect([...new Set(newDat)]);
    } else {
      const filterArray = bulkSelect.filter((item: any): any => !newSchoolID.includes(item));
      setBulkSelect([...new Set(filterArray)]);
    }
  };

  const isSelected = (ids: any, selector?: string) => {
    if (ids.length) {
      const onlyIds = ids?.map((i: any) => i[selector || 'id']);
      return onlyIds.every((v: any) => bulkSelect.includes(v));
    }
    return null;
  };

  const mapperHandler = (headerData: any, data: any, isHeader?: boolean) => {
    if (headerData?.component === COMPONENTS.switch) {
      return <CustomizedSwitches
        hasLabel={false}
        handleOnChange={statusHandler}
        rowData={data}
        checked={data?.status}
      />;
    }
    if (headerData?.component === COMPONENTS?.longmenu) {
      return <LongMenu
        dataArray={moreMenuOptions}
        rowData={data}
        handleChange={handleMoreOption}
      />;
    }
    if (headerData?.component === COMPONENTS?.checkbox) {
      return <CustomCheckbox
        selector={headerData?.selector}
        data={isHeader ? data : [data]}
        handleselect={handleSelectAllClick}
        checked={isHeader ? isSelected(data, headerData?.selector) : bulkSelect.includes(data?.[headerData.selector])}
      />;
    }
    return headerData?.label || 'No data';
  };

  return (
    <TableContainer className="p-[13px]">
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            {subTableHeader?.length ? <TableCell /> : null}
            {
              headerRows?.map((item: any) => (
                <TableCell
                  align={item?.align || 'center'}
                  key={item?.label}
                  sortDirection={orderBy === item?.label ? order : false}
                >
                  {item?.isSort === true ? (
                    <TableSortLabel
                      active={orderBy === item?.label}
                      direction={orderBy === item?.label ? order : 'asc'}
                      onClick={(e: any) => createSortHandler(e, item?.label)}
                    >
                      {item?.label}
                    </TableSortLabel>
                  ) : (
                    item?.component && item?.showInHeader
                      ? (
                        <div className="flex items-center">
                          {mapperHandler(item, tableData, true)}
                          {item?.label}
                        </div>
                      ) : item?.label
                  )}
                </TableCell>
              ))
            }
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData?.map((row: any, index: number): JSX.Element => (
            <Row
              key={row.schoolID}
              row={row}
              index={index}
              rowsPerPage={rowsPerPage}
              currentPage={currentPage}
              subTableHeader={subTableHeader}
              moreMenuOptions={moreMenuOptions}
              handleSelectCheckBox={handleSelectAllClick}
              bulkSelect={bulkSelect}
              isSelected={isSelected}
              handleMoreOption={handleMoreOption}
              statusHandler={statusHandler}
              mapperHandler={mapperHandler}
              headerRows={headerRows}
            />
          ))}
        </TableBody>
      </Table>
      {
        totalPages && totalPages > 1
          ? (
            <NumberedPagination
              totalPages={totalPages}
              paginateHandler={paginateHandler}
              currentPage={currentPage}
            />
          ) : null
      }
    </TableContainer>
  );
};
export default SchoolManagementTable;
