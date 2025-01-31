/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable linebreak-style */
/* eslint-disable comma-dangle */
/* eslint-disable react/jsx-curly-newline */
/* eslint-disable implicit-arrow-linebreak */
import React, { forwardRef, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import { ReactComponent as DeleteRow } from '@images/delete-row.svg';
import { ReactComponent as Assign } from '@images/assign.svg';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { ReactComponent as View } from '@images/view.svg';
import { ReactComponent as Edit } from '@images/edit.svg';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import { COMPONENTS } from '@constants/constants';
import CustomCheckbox from '@component/checkbox/CustomCheckbox';
import LongMenu from '@component/IconMenu/CustomIconMenu';
import CustomizedSwitches from '@component/switch/CustomSwitch';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';

// import Loader from '@shared/loader';
import { NumberedPagination } from '@component/pagination/CustomPagination';
import { LinearProgress } from '@mui/material';
import Row from './Row';

type AdvanceTable = {
  tableData: any;
  currentPage?: number | string | any;
  paginateHandler?: (e: any) => void;
  totalPages?: number;
  maxHeight?: number | string | any;
  rowsPerPage?: string | number;
  handleMoreOption?: (id: any, rowData: any) => void;
  moreMenuOptions?: [] | any;
  headerRows: any;
  subTableHeader?: any;
  bulkSelect?: any;
  setBulkSelect?: any;
  setAbcentBulkSelect?: any;
  abcentBulkSelect?: any;
  orderBy?: any;
  setOrderBy?: any;
  order?: any;
  setOrder?: any;
  statusHandler?: any;
  deleteHandler?: (e: any) => void;
  isLoading?: boolean;
  setPage?: any;
  assignHandler?: any;
  viewHandler?: any;
  actionHandler?: (data: any, handlerName: string) => void;
  toggelAll?: any;
};
const AdvanceTable = forwardRef(
  (props: AdvanceTable, ref: any): JSX.Element => {
    const {
      tableData,
      currentPage,
      paginateHandler,
      totalPages,
      rowsPerPage,
      handleMoreOption,
      moreMenuOptions,
      headerRows,
      subTableHeader,
      bulkSelect,
      setBulkSelect,
      setAbcentBulkSelect,
      abcentBulkSelect,
      order,
      setOrder,
      orderBy,
      setOrderBy,
      statusHandler,
      deleteHandler,
      isLoading,
      setPage,
      assignHandler,
      viewHandler,
      actionHandler,
      toggelAll,
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
      setPage(1);
      handleRequestSort(e, item);
    };
    const handleSelectAllClick = (
      event: React.ChangeEvent<HTMLInputElement>,
      data: any,
      selector?: string
    ): void => {
      const newSchoolID: string[] = data.map((n: any) => n[selector || 'id']);

      if (event) {
        // Add IDs to bulkSelect (Present) and remove from abcentBulkSelect (Absent)
        setBulkSelect((prev) => [...new Set([...prev, ...newSchoolID])]);
        setAbcentBulkSelect((prev) =>
          prev.filter((item: any) => !newSchoolID.includes(item))
        );
      } else {
        // Remove IDs from bulkSelect (Present) only
        setBulkSelect((prev) =>
          prev.filter((item: any) => !newSchoolID.includes(item))
        );
      }
    };

    const handleSelectAllAbsentClick = (
      event: React.ChangeEvent<HTMLInputElement>,
      data: any,
      selector?: string
    ): void => {
      const newSchoolID: string[] = data.map((n: any) => n[selector || 'id']);

      if (event) {
        // Add IDs to abcentBulkSelect (Absent) and remove from bulkSelect (Present)
        setAbcentBulkSelect((prev) => [...new Set([...prev, ...newSchoolID])]);
        setBulkSelect((prev) =>
          prev.filter((item: any) => !newSchoolID.includes(item))
        );
      } else {
        // Remove IDs from abcentBulkSelect (Absent) only
        setAbcentBulkSelect((prev) =>
          prev.filter((item: any) => !newSchoolID.includes(item))
        );
      }
    };

    const isSelected = (ids: any, selector?: string) => {
      if (ids?.length) {
        const onlyIds = ids?.map((i: any) => i[selector || 'id']);
        return onlyIds.every((v: any) => bulkSelect.includes(v));
      }
      return null;
    };

    const isAbsentSelected = (ids: any, selector?: string) => {
      if (ids?.length) {
        const onlyIds = ids?.map((i: any) => i[selector || 'id']);
        return onlyIds.every((v: any) => abcentBulkSelect.includes(v));
      }
      return null;
    };

    const mapperHandler = (headerData: any, data: any, isHeader?: boolean) => {
      if (headerData?.component === COMPONENTS.switch) {
        return (
          <CustomizedSwitches
            hasLabel={false}
            handleOnChange={statusHandler}
            rowData={data}
            checked={data?.status === 'Active' || data?.status === true}
          />
        );
      }
      if (headerData?.component === COMPONENTS?.longmenu) {
        return (
          <LongMenu
            dataArray={headerData?.menuArray || moreMenuOptions}
            rowData={data}
            handleChange={handleMoreOption}
          />
        );
      }
      if (headerData?.component === 'custom-checkbox') {
        return (
          <div className="flex gap-2 justify-left items-center">
            <p className={isHeader && 'font-bold'}>
              Present {isHeader && 'all'}
            </p>

            <CustomCheckbox
              selector={headerData?.selector || data?.id}
              data={isHeader ? data : [data]}
              handleselect={handleSelectAllClick}
              checked={
                isHeader
                  ? isSelected(data, headerData?.selector)
                  : bulkSelect.length > 0
                    ? bulkSelect.includes(data?.[headerData.selector])
                    : data?.isChecked
              }
              sx={isHeader === true ? headerData.sx : headerData.cellSx}
            />

            <CustomCheckbox
              selector={headerData?.selector || data?.id}
              data={isHeader ? data : [data]}
              handleselect={handleSelectAllAbsentClick}
              checked={
                isHeader
                  ? isAbsentSelected(data, headerData?.selector)
                  : abcentBulkSelect.length > 0
                    ? abcentBulkSelect.includes(data?.[headerData.selector])
                    : data?.isAbsent
              }
              sx={isHeader === true ? headerData.sx : headerData.cellSx}
            />
            <p className={isHeader && 'font-bold'}>
              Absent {isHeader && 'all'}
            </p>
          </div>
        );
      }
      if (headerData?.component === COMPONENTS?.checkbox) {
        return (
          <CustomCheckbox
            selector={headerData?.selector || data?.id}
            data={isHeader ? data : [data]}
            handleselect={handleSelectAllClick}
            checked={
              isHeader
                ? isSelected(data, headerData?.selector)
                : bulkSelect.includes(data?.[headerData.selector])
            }
            sx={isHeader === true ? headerData.sx : headerData.cellSx}
          />
        );
      }
      if (headerData?.component === COMPONENTS?.delete) {
        return (
          <span
            role="presentation"
            tabIndex={0}
            className="deleteRow"
            onClick={() => {
              if (deleteHandler) {
                deleteHandler(data);
              }
              if (actionHandler) {
                actionHandler(data, headerData?.component);
              }
            }}
            style={{ cursor: 'pointer', float: headerData?.bodyAlign }}
          >
            <DeleteRow className="tableIcon" style={{ width: '100%' }} />
          </span>
        );
      }
      if (headerData?.component === COMPONENTS?.assign) {
        return (
          <span
            role="presentation"
            tabIndex={0}
            className="deleteRow"
            onClick={() => {
              if (assignHandler) {
                assignHandler(data);
              }
              if (actionHandler) {
                actionHandler(data, headerData?.component);
              }
            }}
            style={{ cursor: 'pointer', float: headerData?.bodyAlign }}
          >
            <Assign className="tableIcon" style={{ width: '100%' }} />
          </span>
        );
      }
      if (headerData?.component === COMPONENTS?.view) {
        return (
          <span
            role="presentation"
            tabIndex={0}
            className="deleteRow viewIcon"
            onClick={() => {
              if (viewHandler) {
                viewHandler(data);
              }
              if (actionHandler) {
                actionHandler(data, headerData?.component);
              }
            }}
            style={{ cursor: 'pointer', float: headerData?.bodyAlign }}
          >
            <RemoveRedEyeIcon style={{ fontSize: '20px' }} />
            {/* <View className="tableIcon" style={{ width: '100%' }} /> */}
          </span>
        );
      }
      if (headerData?.component === COMPONENTS?.edit) {
        return (
          <span
            role="presentation"
            tabIndex={0}
            className="deleteRow"
            onClick={() =>
              actionHandler && actionHandler(data, headerData?.component)
            }
            style={{ cursor: 'pointer', float: headerData?.bodyAlign }}
          >
            <Edit className="tableIcon" style={{ width: '100%' }} />
          </span>
        );
      }
      if (headerData?.component === COMPONENTS?.edit_password) {
        return (
          <span
            role="presentation"
            tabIndex={0}
            className="deleteRow"
            title="Edit password"
            onClick={() =>
              actionHandler && actionHandler(data, headerData?.component)
            }
            style={{ cursor: 'pointer', float: headerData?.bodyAlign }}
          >
            <Edit className="tableIcon" style={{ width: '100%' }} />
          </span>
        );
      }
      if (headerData?.component === COMPONENTS?.download) {
        return (
          <span
            role="presentation"
            tabIndex={0}
            className="deleteRow"
            onClick={() =>
              actionHandler && actionHandler(data, headerData?.component)
            }
            style={{
              cursor: 'pointer',
              float: headerData?.bodyAlign,
              backgroundColor: '#516cf6',
              borderRadius: '5px',
            }}
          >
            <DownloadIcon
              className="tableIcon"
              style={{ width: '100%', color: 'white' }}
            />
          </span>
        );
      }
      if (headerData?.component === COMPONENTS?.share) {
        return (
          <span
            role="presentation"
            tabIndex={0}
            className="deleteRow"
            onClick={() =>
              actionHandler && actionHandler(data, headerData?.component)
            }
            style={{
              cursor: 'pointer',
              float: headerData?.bodyAlign,
              backgroundColor: 'var(--sunlight)',
              borderRadius: '5px',
            }}
          >
            <SendIcon
              className="tableIcon"
              style={{ width: '100%', color: 'white' }}
            />
          </span>
        );
      }
      return headerData?.label || 'No data';
    };

    // console.log('table data =', tableData)

    return (
      <>
        {isLoading && <LinearProgress />}
        <TableContainer
          className="relative"
          ref={ref}
          sx={{ maxHeight: '100%' || props.maxHeight }}
        >
          <Table stickyHeader={true} aria-label="sticky table">
            <TableHead>
              <TableRow>
                {headerRows?.map((item: any, index: number) => (
                  <TableCell
                    key={`${item?.label}-${index}`}
                    align={item?.align || 'left'}
                    sortDirection={orderBy === item?.label ? order : false}
                    colSpan={item?.colspan || 1}
                    sx={item.sx ? item.sx : {}}
                  >
                    {item?.isSort === true ? (
                      <TableSortLabel
                        active={orderBy === item?.mapper}
                        direction={orderBy === item?.mapper ? order : 'asc'}
                        onClick={(e: any) => {
                          createSortHandler(
                            e,
                            item?.filter_by ? item?.filter_by : item?.mapper
                          );
                        }}
                        sx={{
                          '.MuiSvgIcon-root': {
                            opacity: 0.2,
                          },
                        }}
                      >
                        {item?.label}
                      </TableSortLabel>
                    ) : item?.component && item?.showInHeader ? (
                      <>
                        {mapperHandler(item, tableData, true)}
                        <div
                          className={item.elementClass ? item.elementClass : ''}
                        >
                          {item?.label}
                        </div>
                      </>
                    ) : (
                      item?.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {
                tableData?.length ? (
                  tableData?.map(
                    (row: any, index: number): JSX.Element => (
                      <Row
                        key={`${row?.id}-${index}`}
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
                    )
                  )
                ) : (
                  <TableRow>
                    <TableCell colSpan={13} align="center">
                      <p>No data found</p>
                    </TableCell>
                  </TableRow>
                )
                // isLoading
                //   ? null
                //   (
                //     <TableRow>
                //       <TableCell colSpan={13} align="center" className="h-[300px]">
                //         <Loader />
                //       </TableCell>
                //     </TableRow>
                //   )
                //   : (

                //   )
              }
            </TableBody>
          </Table>
        </TableContainer>
        {totalPages && totalPages > 1 ? (
          <NumberedPagination
            totalPages={totalPages}
            paginateHandler={paginateHandler}
            currentPage={currentPage}
          />
        ) : null}
      </>
    );
  }
);
export default AdvanceTable;
