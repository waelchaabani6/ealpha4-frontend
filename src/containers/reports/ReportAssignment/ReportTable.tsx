/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-confusing-arrow */
/* eslint-disable comma-dangle */
import { NumberedPagination } from '@component/pagination/CustomPagination';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Wrapper from '@shared/wrapper/Wrapper';
import { useNavigate } from 'react-router-dom';

type ReportTableProps = {
  tableData: any;
  componentRef: React.MutableRefObject<any>;
  handlePagination: any;
  page: number;
  noOfpages: number;
  link: string;
  TableColumn: any;
  colvalue: number;
};
const ReportTable = ({
  tableData,
  componentRef,
  handlePagination,
  page,
  noOfpages,
  link,
  TableColumn,
  colvalue,
}: ReportTableProps) => {
  const navigate = useNavigate();

  return (
    <div className="wrapperBorder mt-3" ref={componentRef}>
      <Wrapper>
        <TableContainer className="relative" sx={{ maxHeight: '100%' }}>
          <Table stickyHeader={true} aria-label="sticky table">
            <TableHead>
              <TableRow>
                {TableColumn?.map((item: any, index: number) =>
                  item?.label ? (
                    <TableCell
                      key={`${index}`}
                      align={item?.align || 'left'}
                      colSpan={item?.colspan || 1}
                    >
                      {item?.label}
                    </TableCell>
                  ) : (
                    ''
                  )
                )}
              </TableRow>
              <TableRow
                sx={{
                  'th.MuiTableCell-root': {
                    backgroundColor: 'var(--white)',
                  },
                }}
              >
                <TableCell colSpan={colvalue} />
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: 'var(--light-accent) !important',
                  }}
                >
                  Score
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: 'var(--light-accent) !important',
                  }}
                >
                  %
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: 'var(--light-accent) !important',
                  }}
                >
                  Score
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: 'var(--light-accent) !important',
                  }}
                >
                  %
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.length ? (
                tableData?.map(
                  (row: any, index: number): JSX.Element => (
                    <TableRow
                      key={`${row?.id}-${index}`}
                      hover={true}
                      sx={{
                        '& > *': {
                          borderBottom: 'unset',
                          cursor: 'pointer',
                        },
                      }}
                      onClick={() => {
                        const {
                          Program,
                          AssessmentName,
                          Class,
                          AvgClassScore,
                          AvgClassPercentage,
                          AvgCohortScore,
                          AvgCohortPercentage,
                          PerformanceExpectation,
                        } = row;
                        const stateData = {
                          program: Program,
                          assignment: AssessmentName,
                          class: Class,
                          AvgClassScore: AvgClassScore?.toString(), // Ensure it's a string or number
                          AvgClassPercentage: AvgClassPercentage?.toString(), // Ensure it's a string or number
                          AvgCohortScore: AvgCohortScore?.toString(), // Ensure it's a string or number
                          AvgCohortPercentage: AvgCohortPercentage?.toString(), // Ensure it's a string or number
                          PerformanceExpectation:
                            PerformanceExpectation?.toString(), // Ensure it's a string or number
                        };

                        navigate(
                          `${link}/${row.Assignment_ID}/${row.CourseTableId}/${row.classId}`,
                          { state: { ...stateData, page }, replace: true }
                        );
                      }}
                    >
                      {TableColumn?.map((item: any, inn: number) => (
                        <TableCell
                          key={`${item?.label || row?.id}-${inn}`}
                          align={item?.bodyAlign || item?.align || 'left'}
                        >
                          {row[item?.mapper]}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                )
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

        {noOfpages && noOfpages > 1 ? (
          <NumberedPagination
            totalPages={noOfpages}
            paginateHandler={handlePagination}
            currentPage={page}
          />
        ) : null}
      </Wrapper>
    </div>
  );
};

export default ReportTable;
