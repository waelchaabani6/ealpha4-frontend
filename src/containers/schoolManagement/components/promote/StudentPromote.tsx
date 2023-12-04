import { useState, useEffect, useRef } from 'react';
import ReactToPrint from 'react-to-print';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import { ReactComponent as Download } from '@images/pageHeaderIcons/download.svg';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import PrintIcon from '@mui/icons-material/Print';
import { useNavigate } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import Dropdown from '@component/dropdown/Dropdown';
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import AutoComplete from '@component/autoComplete/autoComplete';
import Button from '@component/button/button';
import { RadioGroup, FormControlLabel, FormControl, FormLabel, Radio } from '@mui/material';
// import  Radio  from '@mui/icons-material/Radio';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import RouteLayout from '@layout/routeLayout';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { useSelector } from 'react-redux';
import { RESULTS_PER_PAGE, TABLE_LABELS, TOOLBAR_LABELS } from '../../../../constants/constants';
import CustomPagination from '../../../../components/pagination/CustomPagination';
import Wrapper from '../../../../shared/wrapper/Wrapper';

const printButton = () => <PrintIcon />;

const StudentPromote = () => {
  const noOfpages = 1;
  const navigate = useNavigate();
  const componentRef = useRef(null);
  const { schoolData, branchData } = useSelector(selectSchoolData);

  const TableColumns = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center'
    },
    {
      label: TABLE_LABELS?.FIRST_NAME,
      mapper: 'first_name',
      isSort: true
    },
    {
      label: TABLE_LABELS?.LAST_NAME,
      mapper: 'last_name',
      isSort: true
    },
    {
      label: TABLE_LABELS?.GRADE,
      mapper: 'grade',
      isSort: true
    },
    {
      label: TABLE_LABELS?.ACTION,
      mapper: 'assign_action',
      align: 'center'
    }
  ];

  const [tableData, setTableData] = useState<any>([]);

  const ADMIN_TOOLBAR_MENU = [
    {
      title: TOOLBAR_LABELS.ADD,
      icon: <AddIcon />
    },
    {
      title: TOOLBAR_LABELS.IMPORT,
      icon: <DriveFolderUploadIcon />
    },
    {
      title: TOOLBAR_LABELS.EMAIL,
      icon: <EmailIcon />
    },
    {
      title: TOOLBAR_LABELS.EXPORT,
      icon: (
        <CSVLink
          filename="School Management List.csv"
          data=""
          enclosingCharacter=""
        >
          <Share />
        </CSVLink>
      )
    },
    {
      title: TOOLBAR_LABELS.PRINT,
      icon: <ReactToPrint
        trigger={printButton}
        content={() => componentRef.current}
      />
    }
  ];
  const ALL = {
    label: 'All',
    value: 'All'
  };
  const [selectData, setSelectData] = useState<any>(ALL?.value);
  const [selectedAcademicYear, setselectedAcademicYear] = useState(ALL?.value);
  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [page, setPage] = useState(1);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [academicYearArray, setAcademicYearArray] = useState<any>([ALL]);
  const [playloadData, setPlayloadData] = useState<any | undefined>({});
  const [popupData, setpopupData] = useState<any>({});
  const [order, setOrder] = useState<any>('desc');
  const [orderBy, setOrderBy] = useState<any>('created_at');
  const [radio, setRedio] = useState({
    pass: false,
    fail: false
  });

  const handleStatus = (e: any) => {
    setSelectData(e);
  };

  const radioHandler = () => {

  };
  const handleAcademic = (e: any) => {
    // setselectedAcademicYear(e);
  };

  const handlePerPage = (e: any) => {
    setPage(1);
    setRowsPerPage(e);
  };
  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };
  const handleToolbarAction = async (title: string) => {
    // if (title === TOOLBAR_LABELS.ADD) {
    //   navigate(routes?.SCHOOL_MANAGEMENT__ADD);
    // } else if (title === TOOLBAR_LABELS.PRINT) {
    //   window.print();
    // } else if (title === TOOLBAR_LABELS.EMAIL) {
    //   handelSendEmail();
    // } else if (title === TOOLBAR_LABELS.IMPORT) {
    //   importData();
    // }
  };

  const statusHandler = (e: any, data: object | any) => {
    const payload = {
      status: (e.target.checked) ? 'Active' : 'Inactive'
    };
    if ('branch_ting' in data) {
      setPlayloadData({
        apicall: 'branchStatus',
        payload,
        id: data?.id
      });
    } else {
      setPlayloadData({
        apicall: 'schoolStatus',
        payload,
        id: data?.school_id
      });
    }
  };

  const tableReset = () => {
    setPage(1);
    // setTableData([]);
    setTotalDataCount(0);
    // setBulkSelect([]);
  };

  const allStateReset = () => {
    tableReset();
    tempDataReset();
  };

  const tempDataReset = () => {
    setPlayloadData({});
    setpopupData({});
  };

  useEffect(() => {
    const rows = [];
    for (let i = 0; i < 10; i += 1) {
      rows.push(
        {
          id: Math.ceil(new Date().getTime() * Math.random()),
          first_name: `Subodh-${i}`,
          last_name: `Kumar-${i}`,
          grade: `1A -${i}`,
          status: `pass-${i}`,
          assign_action: (
            <div className="flex justify-center ">
              <RadioGroup
                row={true}
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                onChange={(e: any) => handleOnchange(e.target.value)}
              >
                <FormControlLabel value="Pass" control={<Radio color="success" size="small" />} label="Pass" />
                <FormControlLabel value="Fail" control={<Radio color="success" size="small" />} label="Fail" />
              </RadioGroup>
            </div>
          )
        }
      );
    }
    setTotalDataCount(rows?.length);
    setTableData(rows);
  }, []);
  const handleOnchange = (res: any) => {
    // console.log(res);
  };
  // Get School Listing
  const temps = (rowsPerPage === 'all') ? totalDataCount : rowsPerPage;
  const onSelect = (value: any) => {

  };
  const list = (data: any[]): JSX.Element[] => data?.map((item: any, index: number) => (
    <li key={item.id} data-target={index}>{item.name}</li>
  ));
  return (
    <RouteLayout>
      <HeaderMenus
        title="Promote Student"
        subtitle={`School : ${schoolData?.school_name || branchData?.school_data?.school_name}`}
        subtitle2={branchData?.name ? `Branch : ${branchData?.name}` : ''}
        menuArray={ADMIN_TOOLBAR_MENU}
        handleToolbarAction={handleToolbarAction}
      />
      <div>
        <div className="flex justify-between">
          <div className="flex flex-wrap md:justify-start justify-center gap-2 lg:grow grow-0">
            <div className="pt-[30px]">
              <AutoComplete
                path="https://jsonplaceholder.typicode.com/posts"
                list={list}
                onSelect={onSelect}
                targetKey="title"
                appendSearch={false}
              />
            </div>
            <Dropdown
              title="Select class"
              value={rowsPerPage}
              dataArray={RESULTS_PER_PAGE}
              onChangeHandler={handleAcademic}
            />
            <Dropdown
              title="Select subject"
              value={rowsPerPage}
              dataArray={RESULTS_PER_PAGE}
              onChangeHandler={handlePerPage}
            />
          </div>
          <div className="mt-5">
            <CustomPagination
              totalPages={noOfpages}
              paginateHandler={handlePagination}
              currentPage={page}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between my-5">
        <div className="flex flex-row my-2">
          <div className="flex flex-row font-semibold">
            <h1> Class : 1A </h1>
            <h1 className="pl-3"> | </h1>
          </div>
          <div className="pl-3 font-semibold">
            <h1> Subject : Alpha Math </h1>
          </div>
        </div>
        <div className="flex flex-row">
          <div className="mr-3">
            <Button variant="outlined">Fail All</Button>
          </div>
          <div>
            <Button>Pass All</Button>
          </div>
        </div>
      </div>
      <div className="wrapperBorder mt-3" ref={componentRef}>
        <Wrapper>
          <AdvanceTable
            tableData={tableData}
            headerRows={TableColumns}
            totalPages={noOfpages}
            paginateHandler={handlePagination}
            currentPage={page}
            rowsPerPage={rowsPerPage}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
            order={order}
            setOrder={setOrder}
            statusHandler={statusHandler}
            setPage={setPage}
            maxHeight={620}
          />
          <div className=" my-5 flex justify-end ">
            <Button size="medium">submit</Button>
          </div>
        </Wrapper>
      </div>
    </RouteLayout>
  );
};

export default StudentPromote;
