import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import moment from 'moment';

const Row = (props: any) => {
  const {
    row,
    index,
    rowsPerPage,
    currentPage,
    subTableHeader,
    handleSelectCheckBox,
    mapperHandler,
    headerRows
  } = props;
  const [open, setOpen] = useState(false);
  const CHILD_KEY = 'subData';

  return (
    <>
      <TableRow
        key={`${row?.id}-${index}`}
        sx={
          { '& > *': { borderBottom: 'unset' }, ...row?.rowSx }
        }
      >
        {
          headerRows?.map((item: any, inn: number) => {
            let renderContent = '';
            if (item?.mapper === 'Cource') {
              renderContent = (row[item?.mapper] || []).map((dt: any) => (
                <div style={{ minWidth: '120px' }} key={`${dt}`}>{dt}</div>
              ));
            } else if (item?.mapper && !item?.component) {
              if (item?.format) {
                renderContent = moment(row[item?.mapper]).format(item?.format || 'DD-MM-YYYY');
              } else {
                renderContent = Array.isArray(row[item?.mapper])
                  ? row[item?.mapper].join(', ')
                  : row[item?.mapper] === 0 ? 0 : (row[item?.mapper] || <i>N/A</i>);
              }
            } else if (item?.component) {
              renderContent = mapperHandler(item, row);
            } else if (item?.label) {
              renderContent = typeof (rowsPerPage) === 'number'
                ? rowsPerPage * (currentPage - 1) + (index + 1)
                : currentPage + index;
            }
            return (
              <TableCell key={`${item?.label || row?.id}-${inn}`} align={item?.bodyAlign || item?.align || 'left'}>
                {subTableHeader?.length && item?.isAdd ? (
                  (CHILD_KEY in row) && row?.subData?.length
                    ? (
                      <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => {
                          setOpen(!open);
                          handleSelectCheckBox(false, row?.subData);
                        }}
                        className="tableIconButton"
                      >
                        {open ? <RemoveIcon /> : <AddIcon />}
                      </IconButton>
                    )
                    : null
                ) : renderContent}
              </TableCell>
            );
          })
        }
      </TableRow>
      {
        (CHILD_KEY in row) && row?.subData?.length > 0 && subTableHeader?.length
          ? (
            <TableRow
              key={row?.id || 'dummy'}
              sx={{
                border: 'none !important'
              }}
            >
              <TableCell style={{ padding: 0 }} colSpan={headerRows?.length}>
                <Collapse in={open} timeout="auto" unmountOnExit={true}>
                  <Box className="innerBoxContainer">
                    <Table size="small" aria-label="purchases">
                      <TableHead>
                        <TableRow>
                          {
                            subTableHeader?.map((item: any, i: number) => (
                              <TableCell key={`${item?.label}-${i}`} align={item?.align || 'left'}>
                                {
                                  item?.component && item?.showInHeader
                                    ? (
                                      <>
                                        {mapperHandler(item, row?.subData, true)}
                                        {item?.label}
                                      </>
                                    ) : item?.label
                                }
                              </TableCell>
                            ))
                          }
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {
                          row?.subData.length && row?.subData.map((item: any, ind: number) => (
                            <TableRow key={`${item?.id}-${ind}`}>
                              {

                                subTableHeader?.map((subItem: any, i: any) => {
                                  let renderContent = '';
                                  if (subItem?.mapper === 'Cource') {
                                    renderContent = (item[subItem?.mapper] || []).map((dt: any) => (
                                      <div style={{ minWidth: '120px' }} key={`${dt}`}>{dt}</div>
                                    ));
                                  } else if (subItem?.mapper && !subItem?.component) {
                                    if (subItem?.format) {
                                      renderContent = moment(item[subItem?.mapper]).format(subItem?.format || 'DD-MM-YYYY');
                                    } else {
                                      renderContent = item[subItem?.mapper];
                                    }
                                  } else if (subItem?.component) {
                                    renderContent = mapperHandler(subItem, item);
                                  } else {
                                    renderContent = (ind + 1).toString();
                                  }

                                  return (
                                    <TableCell key={`${subItem?.label}-${i}`} align={subItem?.align || 'left'}>
                                      {renderContent}
                                    </TableCell>
                                  );
                                })
                              }
                            </TableRow>
                          ))
                        }
                      </TableBody>
                    </Table>
                  </Box>
                </Collapse>
              </TableCell>
            </TableRow>
          ) : null
      }
    </>
  );
};

export default Row;
