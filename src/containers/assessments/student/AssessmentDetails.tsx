/* eslint-disable react/jsx-one-expression-per-line */
import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import { CSVLink } from 'react-csv';
import { ReactComponent as Download } from '@images/pageHeaderIcons/download.svg';
import ReactToPrint from 'react-to-print';
import routes from '@constants/routes';
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import Wrapper from '@shared/wrapper/Wrapper';
import Dropdown from '@component/dropdown/Dropdown';
import RouteLayout from '../../layout/routeLayout';
import {
  STATUS_ITEMS,
  RESULTS_PER_PAGE,
  COMPONENTS,
  TABLE_LABELS,
  TOOLBAR_LABELS,
} from '../../../constants/constants';
import SimpleTableDx from '../../../components/SimpleTableDx/index';

const printButton = () => <PrintIcon />;

const dataArray = [
  { label: 'Page', value: 'Page' },
  { label: 'Page 1', value: 'Page 1' },
  { label: 'Page 2', value: 'Page 2' },
  { label: 'Page 3', value: 'Page 3' },
];

const headers = [
  TABLE_LABELS?.SR_NO,
  TABLE_LABELS?.ASSIGNMET_NAME,
  TABLE_LABELS?.COURSES,
  TABLE_LABELS?.GRADE,
  TABLE_LABELS?.LESSONS,
  TABLE_LABELS?.STATE,
  TABLE_LABELS?.CLASS_STUDENTS,
  TABLE_LABELS?.START_DATE,
  TABLE_LABELS?.END_DATE,
  TABLE_LABELS?.SCORE,
];

const csvSubHeaders = [
  TABLE_LABELS?.SR_NO,
  TABLE_LABELS?.ASSIGNMET_NAME,
  TABLE_LABELS?.COURSES,
  TABLE_LABELS?.GRADE,
  TABLE_LABELS?.LESSONS,
  TABLE_LABELS?.STATE,
  TABLE_LABELS?.CLASS_STUDENTS,
  TABLE_LABELS?.START_DATE,
  TABLE_LABELS?.END_DATE,
  TABLE_LABELS?.SCORE,
];
// Here -->
interface Column {
  id: 'page_name' | 'Score' | 'Unattempted' | 'Wrong' | 'Correct';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
  component?: 'Dropdown';
  dataArray?: Array<{ label: string; value: string }>;
  selectedValue?: string;
}
// readonly Column[]
const columns: Column[] = [
  {
    id: 'page_name',
    label: 'Page',
    minWidth: 170,
    align: 'right',
    component: 'Dropdown',
    dataArray,
    selectedValue: 'Page',
  },
  { id: 'Score', label: 'Score', minWidth: 100, align: 'right' },
  { id: 'Unattempted', label: 'Unattempted', minWidth: 170, align: 'right' },
  { id: 'Wrong', label: 'Wrong', minWidth: 170, align: 'right' },
  { id: 'Correct', label: 'Correct', minWidth: 170, align: 'right' },
];

interface Data {
  Pages: string;
  page_name: string;
  Score: string;
  Unattempted: number;
  Wrong: number;
  Correct: number;
}

function createData(
  Pages: string,
  page_name: string,
  Score: string,
  Unattempted: number,
  Wrong: number,
  Correct: number
): Data {
  return { Pages, page_name, Score, Unattempted, Wrong, Correct };
}

const rows = [
  createData('Page1', 'Page1', '30%', 1, 1, 1),
  createData('Page2', 'Page2', '10%', 1, 1, 1),
  createData('Page3', 'Page3', '70%', 1, 1, 1),
];

function AssessmentDetails() {
  const navigate = useNavigate();
  const [csvData, setCsvData] = useState<[]>([]);
  const [bulkSelect, setBulkSelect] = useState<any>([]);
  const [playloadData, setPlayloadData] = useState<any | undefined>({});
  const [columnsHeader, setColumns] = useState(columns);

  const score = 70;

  const componentRef = useRef(null);

  const handelSendEmail = () => {
    const payload = {
      list_type: 'school-list',
    };
    setPlayloadData({
      apicall: 'sendEmail',
      payload,
    });
  };

  const changeColumnsHeader = (val: string, cIndex: number) => {
    const columnsHeader2 = columnsHeader.map((ele, index) => {
      if (ele.component === 'Dropdown' && cIndex === index) {
        return { ...ele, selectedValue: val };
      }
      return ele;
    });
    setColumns(columnsHeader2);
  };

  const handleToolbarAction = async (title: string) => {
    if (title === TOOLBAR_LABELS.ADD_NEW_SCHOOL) {
      navigate(routes?.SCHOOL_MANAGEMENT__ADD);
    } else if (title === TOOLBAR_LABELS.EMAIL) {
      handelSendEmail();
    } else if (title === TOOLBAR_LABELS.IMPORT) {
      // importData();
    }
  };

  const ADMIN_TOOLBAR_MENU = [
    // {
    //   title: TOOLBAR_LABELS.EMAIL,
    //   icon: <EmailIcon />,
    // },
    {
      title: 'Download',
      icon: <Download />,
    },
    {
      title: TOOLBAR_LABELS.PRINT,
      icon: (
        <ReactToPrint
          trigger={printButton}
          content={() => componentRef.current}
        />
      ),
    },
  ];

  // eslint-disable-next-line consistent-return
  function colorCode(scoreAch: number, type: string) {
    if (scoreAch <= 35) {
      return { bg: '#FCD4C6', color: '#E36B6B' }[type]; // Red
    }
    if (scoreAch > 35 && scoreAch <= 50) {
      return { bg: '#FFF9BE', color: '#C7B551' }[type]; // Yello
    }
    if (scoreAch > 50 && scoreAch <= 70) {
      return { bg: '#d9ffc8', color: '#6CA463' }[type]; // blue
    }
    if (scoreAch >= 70) {
      return { bg: '#beccff', color: '#132E90 ' }[type]; // green
    }
  }

  return (
    <div>
      <RouteLayout>
        <HeaderMenus
          title="Assessment Details"
          menuArray={ADMIN_TOOLBAR_MENU}
          handleToolbarAction={handleToolbarAction}
        />

        <div className="flex flex-col bg-white p-4 mt-5 md:flex-row">
          <div className="flex flex-col grow md:flex-row ">
            <div className="grow flex flex-col md:border-r md:border-r-gray-300">
              <div className="mb-5">
                <div className="font-bold">Assessment Name</div>
                <div>Maths Homework - Grade 1 - Aug 24th</div>
              </div>

              <div className="mb-5">
                <div className="font-bold"> Lesson </div>
                <div> 11,12,13 Adding of Numbers </div>
              </div>

              <div>
                <div className="font-bold"> Teacher </div>
                <div> Mark MSE </div>
              </div>
            </div>

            <div className="grow md:border-r md:border-r-gray-300 md:ml-4">
              <div className="mb-5">
                <div className="font-bold"> Status: Submitted </div>
                <div> 15-08-2022, 11:00 AM </div>
              </div>

              <div>
                <div className="font-bold"> Status: Marked as complete </div>
                <div> 15-08-2022 </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col grow md:flex-row">
            <div className="grow md:border-r md:border-r-gray-300 md:ml-4">
              <div className="mb-5">
                <div className="font-bold"> Start Date </div>
                <div> 15-08-2022 </div>
              </div>

              <div>
                <div className="font-bold"> End Date </div>
                <div> 18-08-2022 </div>
              </div>
            </div>

            <div className="grow box-content flex items-center h-full justify-center">
              <div
                style={{ backgroundColor: colorCode(score, 'bg') }}
                className="h-3/5 w-5/6 flex items-center justify-center md:text-2xl text-sm rounded"
              >
                Score
                <span
                  className="text-blue-100"
                  style={{ color: colorCode(score, 'color') }}
                >
                  &nbsp;
                  {score}% ({`${score}`}
                  /100) &nbsp;
                </span>
                - Meets
              </div>
            </div>
          </div>
        </div>

        <div className="wrapperBorder mt-8" ref={componentRef}>
          <Wrapper>
            <SimpleTableDx
              rows={rows}
              columns={columnsHeader}
              onChangeHandler={(val: string, cIndex: number) => {
                changeColumnsHeader(val, cIndex);
              }}
            />
            {/* <AdvanceTable
              tableData={tableData}
              headerRows={TableColumns}
              totalPages={noOfpages}
              paginateHandler={handlePagination}
              currentPage={page}
              setPage={setPage}
              rowsPerPage={rowsPerPage}
              // handleMoreOption={handleMoreOption}
              // moreMenuOptions={moreMenuOptions}
              // subTableHeader={subTableHeader}
              // setBulkSelect={setBulkSelect}
              // bulkSelect={bulkSelect}
              orderBy={orderBy}
              setOrderBy={setOrderBy}
              order={order}
              setOrder={setOrder}
            // statusHandler={statusHandler}
            // isLoading={loadingDeleteSchool || isLoading || loadingStatus}
            /> */}
          </Wrapper>
        </div>
      </RouteLayout>
    </div>
  );
}

export default AssessmentDetails;
