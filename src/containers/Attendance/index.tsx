/* eslint-disable linebreak-style */
/* eslint-disable no-console */
/* eslint-disable operator-linebreak */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable indent */
/* eslint-disable comma-dangle */
import RouteLayout from '@layout/routeLayout';
import Button from '@component/button/button';
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  TABLE_LABELS,
  TOOLBAR_LABELS,
  RESULTS_PER_PAGE,
} from '@constants/constants';
import Wrapper from '@shared/wrapper/Wrapper';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { useSelector } from 'react-redux';
import { selectSchoolData } from '@shared/store/schoolSlice';
import ReactToPrint from 'react-to-print';
import PrintIcon from '@mui/icons-material/Print';
import { useGet, usePost } from '@shared/api/useApi';
import {
  currentUserAcademicDate,
  getNoOfPages,
  incrementDateByOne,
  userRole,
} from '@utility/utility';
import toast from '@shared/toast';
import moment from 'moment';
import { selectUser } from '@shared/store/userSlice';
import { useNavigate, useParams } from 'react-router-dom';
import MarkAttendanceFilters from './components/MarkAttendanceFilters';
import { Student } from './types';
import StatusComponent from './components/StatusComponent';

const printButton = () => <PrintIcon />;

const TableColumns = [
  {
    label: TABLE_LABELS?.SR_NO,
    align: 'center',
  },

  {
    label: 'Student First Name',
    mapper: 'StudentFirstName',
    isSort: false,
  },
  {
    label: 'Student Last Name',
    mapper: 'StudentLastName',
  },
  {
    label: 'Grade',
    mapper: 'Grade',
  },
  // {
  //   label: 'Status',
  //   mapper: 'Status',
  //   align: 'center',
  // },

  {
    label: '',
    mapper: 'Select',
    component: 'custom-checkbox',
    selector: 'id',
    showInHeader: true,
    align: 'center',
    sx: {
      display: 'flex',
      alignItems: 'center',
    },
    cellSx: {
      justifyContent: 'flex-start',
      position: 'relative',
      left: '0px',
    },
    elementClass: 'flex items-center',
  },
];

function Attendance() {
  const [tableData, setTableData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [orderBy, setOrderBy] = useState<any>('created_at');
  const [order, setOrder] = useState<any>('asc');
  const [bulkSelect, setBulkSelect] = useState<any>([]);
  const [selectedBranch, setSelectedBranch] = useState<
    number | null | 'select'
  >('select');
  const [selectedClass, setSelectedClass] = useState<number | null | 'select'>(
    'select'
  );

  const { branchId } = useSelector(selectUser);
  const [searchString, setSearchString] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const [totalDataCount, setTotalDataCount] = useState(0);

  const noOfpages = getNoOfPages(totalDataCount, RESULTS_PER_PAGE?.[0]);
  const componentRef = useRef(null);
  const [courses, setCourses] = useState<any>([]);

  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [currentClassName, SetCurrentClassName] = useState<string>('');

  const navigate = useNavigate();
  const { schoolName } = useParams();

  const formatSelectedDate = useMemo(
    () => moment(selectedDate).format('yyyy-MM-DD'),
    [selectedDate]
  );

  const generatedUrl = `roster-service/student-attendance-list?limit=${10}&school_id=${schoolData?.id || branchData?.school_data?.id}&subject=${currentClassName || ''}&class_name=${currentClassName}${selectedDate ? `&date=${formatSelectedDate}` : ''}${branchData ? `&branch_id=${branchData?.id}` : selectedBranch !== 'select' ? `&branch_id=${selectedBranch}` : ''}&offset=${(page - 1) * Number(noOfpages)}${searchString ? `&search=${searchString}` : ''}`;
  const cleanedUrl = generatedUrl.trim().replace(/\s+/g, ' ');

  const { data, isLoading, refetch } = useGet({
    baseURL: import.meta.env.VITE_APP_ROSTER_SERVICE_URL,
    url: `${cleanedUrl}`,
    enabled: Boolean(
      (selectedClass !== 'select' && selectedDate) ||
        (selectedClass !== 'select' &&
          selectedDate &&
          selectedBranch !== 'select')
    ),
    onSuccess: (res: any) => {
      setTotalDataCount(res?.data?.response?.count);
    },
  });

  const { isLoading: isLoading3, mutate } = usePost({
    baseURL: import.meta.env.VITE_APP_ROSTER_SERVICE_URL,
    url: 'roster-service/create-attendance-data',
    onSuccess: () => {
      refetch();
      toast('success', 'Attendance Updated Successfully!');
      setBulkSelect([]);
      navigate(`/${schoolName}/attandance/reports`);
    },
    onError: (error: any) => {
      toast('error', error?.response?.data?.message);
    },
  });

  const ADMIN_TOOLBAR_MENU = [
    // {
    //   title: TOOLBAR_LABELS.ADD,
    //   icon: <AddIcon />
    // },
    // {
    //   title: TOOLBAR_LABELS.IMPORT,
    //   icon: <DriveFolderUploadIcon />
    // },
    // {
    //   title: TOOLBAR_LABELS.EMAIL,
    //   icon: <EmailIcon />
    // },
    // {
    //   title: TOOLBAR_LABELS.EXPORT,
    //   icon: <CSVLink filename="Class List.csv" onClick={onCsvClick} data={csvData} headers={headers} enclosingCharacter=""><Share /></CSVLink>
    // },
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

  const handleSelection = (params: any) => {
    setBulkSelect(params);
  };

  const handleOnchange = (id: number) => {
    console.log('id is', id);
    const index = tmpTableData.findIndex((itm: any) => itm.id === id);
    if (index > -1) {
      const oldD = data?.data?.response?.result[index].is_present;
      const newD = !tmpTableData[index].isPresent;
      setTmpTableData([
        ...tmpTableData.slice(0, index),
        {
          ...tmpTableData[index],
          isPresent: newD,
        },
        ...tmpTableData.slice(index + 1),
      ]);
      if (oldD !== newD) {
        setBulkSelect(
          Array.from(new Set([...bulkSelect, tmpTableData[index].id]))
        );
      } else {
        setBulkSelect((prev: number[]) =>
          prev?.filter((ids: number) => ids !== tmpTableData[index].id)
        );
      }
    }
  };

  const [tmpTableData, setTmpTableData] = useState<any[]>([]);

  useEffect(() => {
    const bb = tmpTableData?.map((itm: any, index: number) => ({
      id: itm?.id,
      SR_NO: index + 1,
      StudentFirstName: itm?.StudentFirstName,
      StudentLastName: itm?.StudentLastName,
      Grade: itm?.Grade,
      isChecked: itm.isChecked,
      Status: <StatusComponent itm={itm} handleOnchange={handleOnchange} />,
    }));

    setTableData(bb || []);
  }, [tmpTableData]);

  useEffect(() => {
    if (data) {
      const aa =
        data?.data?.response?.result?.map((itm: any, index: number) => ({
          id: itm?.id,
          SR_NO: index + 1,
          StudentFirstName: itm?.first_name,
          StudentLastName: itm?.last_name,
          Grade: itm?.class_name,
          isChecked: false,
          isPresent: itm?.is_present,
        })) || [];
      setTmpTableData(aa);
    }
  }, [data]);

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const submitHandler = () => {
    console.log(bulkSelect, 'bulkSelect');
    const dt = bulkSelect?.map((item: any) => {
      const idx = tmpTableData.find((itm: any) => itm.id === item);
      // console.log(idx);
      console.log(item);
      // // console.log(idx);
      if (idx) {
        const tmp = {
          student: item,
          school_id: schoolData?.id || branchData?.school_data?.id,
          school_class: selectedClass,
          // subject: subjectName || '',
          present: idx?.isPresent,
          present_on_date: formatSelectedDate,
        } as any;
        if (branchId) {
          tmp.branch_id = branchId;
        }
        if (selectedBranch !== 'select') {
          tmp.branch_id = selectedBranch;
        }
        return tmp;
      }
      return null;
    });
    console.log('submit data', dt);
    mutate(dt);
  };

  const toggleAllHandler = (flag = true) => {
    console.log('here toggle all');
    const dt = data?.data?.response?.result?.map((item: any) => {
      const tmp = {
        student: item?.id,
        school_id: schoolData?.id || branchData?.school_data?.id,
        school_class: selectedClass,
        // subject: subjectName || '',
        present: flag,
        present_on_date: formatSelectedDate,
      } as any;
      if (branchId) {
        tmp.branch_id = branchId;
      }

      if (selectedBranch !== 'select') {
        tmp.branch_id = selectedBranch;
      }
      return tmp;
    });

    // console.log(dt, 'dt');
    // const ids = data?.data?.response?.result?.map((item: any) => item?.id);
    // bulkSelect.find((i: any) => i.student === itm?.id)?.isPresent
    // console.log(ids, 'ids');
    // setBulkSelect(ids);
    // mutate(dt);
  };

  const minStartDate = useMemo(() => {
    const targetDate = incrementDateByOne(currentUserAcademicDate()?.start, -5);
    if (new Date() >= currentUserAcademicDate()?.start) {
      return new Date();
    }
    return targetDate;
  }, [schoolData, branchData]);

  return (
    <RouteLayout navBack={true} overflow={true}>
      <HeaderMenus
        title="Attendance"
        subtitle={
          userRole().isSuperAdmin
            ? `School : ${
                schoolData
                  ? schoolData?.school_name
                  : branchData?.school_data.school_name
              }`
            : ''
        }
        subtitle2={branchData?.name ? `Branch : ${branchData?.name}` : ''}
        menuArray={ADMIN_TOOLBAR_MENU}
        // handleToolbarAction={handleToolbarAction}
      />

      <MarkAttendanceFilters
        searchResults={searchResults}
        setSearchResults={setSearchResults}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        setCurrentClassName={SetCurrentClassName}
        setTableData={setTableData}
        setCourses={setCourses}
        courses={courses}
        setTmpTableData={setTmpTableData}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      <div className="bg-white" ref={componentRef}>
        <Wrapper>
          <AdvanceTable
            isLoading={isLoading}
            tableData={tableData}
            headerRows={TableColumns}
            totalPages={noOfpages}
            paginateHandler={handlePagination}
            currentPage={page}
            rowsPerPage={RESULTS_PER_PAGE?.[0]}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
            order={order}
            setOrder={setOrder}
            setPage={setPage}
            setBulkSelect={handleSelection}
            maxHeight={620}
            bulkSelect={bulkSelect}
            toggelAll={toggleAllHandler}
          />
        </Wrapper>
      </div>
      <div className="flex justify-end py-2">
        <Button
          disabled={isLoading3 || bulkSelect.length < 1}
          onClick={submitHandler}
          loading={isLoading3}
        >
          Submit
        </Button>
      </div>
    </RouteLayout>
  );
}

export default Attendance;
