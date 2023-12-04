/* eslint-disable no-console */
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import Button from '@component/button/button';
import { COMPONENTS, RESULTS_PER_PAGE, TABLE_LABELS, TABLE_MANAGE_UPLOADFORM } from '@constants/constants';
import { SCHOOL_MANAGEMENT, SCHOOL, PREVIEW } from '@constants/routes';
import Wrapper from '@shared/wrapper/Wrapper';
import toast from '@shared/toast';
import DeletePopup from '@shared/DeletePopup';
import { useGet, useDelete } from '@shared/api/useApi';
import { getNoOfPages } from '@utility/utility';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const Global = () => {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState<any>([]);
  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [page, setPage] = useState(1);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [order, setOrder] = useState<any>('desc');
  const [orderBy, setOrderBy] = useState<any>('created_at');
  const [courseDeleteDialog, setCourseDeleteDialog] = useState(false);
  const [deleteCourseId, setdeleteCourseId] = useState<number | null>(null);

  const TableColumns = [
    {
      label: TABLE_MANAGE_UPLOADFORM?.SR_NO,
      align: 'center'
    },
    {
      label: TABLE_MANAGE_UPLOADFORM?.COURSE_NAME,
      mapper: 'name',
      isSort: true
    },
    {
      label: TABLE_MANAGE_UPLOADFORM?.UPLOADED_FROM,
      mapper: 'uploaded_from',
      isSort: false
    },
    {
      label: 'Created At',
      mapper: 'created_at',
      isSort: false
    },
    {
      label: TABLE_MANAGE_UPLOADFORM?.STATUS,
      mapper: 'course_upload_status',
      align: 'left',
      isSort: false
    },
    {
      label: TABLE_LABELS?.ACTION,
      mapper: 'Action',
      align: 'left',
      component: COMPONENTS?.delete,
      showInHeader: false
    }
  ];
  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };
  const statusHandler = (e: any, data: object) => {
    // console.log('e', e, data);
  };
  const tableReset = () => {
    setPage(1);
    setTableData([]);
    setTotalDataCount(0);
  };

  const handleCourseDelete = () => {
    setCourseDeleteDialog(false);
    mutateDeleteCourse(deleteCourseId);
  };

  const navigatePreview = () => {
    navigate(`${PREVIEW}`);
  };

  // Get Course Upload Listing
  const temps = (rowsPerPage === 'all') ? totalDataCount : rowsPerPage;
  const ordering = order === 'asc' ? orderBy : `-${orderBy}`;
  const { isLoading, refetch } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/?limit=${temps}&offset=${(page - 1) * Number(temps)}&ordering=${ordering}&course_upload_status=all`,
    onSuccess: (resp: any) => {
      const accData = resp?.data?.response;
      const respData = accData?.results;
      if (respData?.length) {
        setTotalDataCount(accData?.count);
        setTableData(respData?.map((itm: any) => ({ ...itm, created_at: moment(itm.created_at).format('DD-MM-yyyy') })));
      } else {
        tableReset();
      }
    },
    enabled: false
  });
  /* ---------------------------------------------------------------------------------------------------------
     * End API *
     --------------------------------------------------------------------------------------------------------- */

  //  Delete School
  const { isLoading: loadingDeleteCourse, mutate: mutateDeleteCourse } = useDelete({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/${deleteCourseId}/delete/`,
    onSuccess: (response: any) => {
      setdeleteCourseId(null);
      refetch();
      toast('success', 'Course deleted successfully');
    },
    enabled: !!deleteCourseId,
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    refetch();
  }, [page, orderBy, order]);

  const deleteHandler = (row: any) => {
    setdeleteCourseId(row.id);
    setCourseDeleteDialog(true);
  };

  return (
    <div className="wrapperBorder">
      <Wrapper>
        <AdvanceTable
          tableData={tableData}
          headerRows={TableColumns}
          totalPages={noOfpages}
          paginateHandler={handlePagination}
          currentPage={page}
          rowsPerPage={rowsPerPage}
          setOrderBy={setOrderBy}
          orderBy={orderBy}
          order={order}
          setOrder={setOrder}
          statusHandler={statusHandler}
          deleteHandler={deleteHandler}
          setPage={setPage}
          isLoading={isLoading || loadingDeleteCourse}
        />

      </Wrapper>
      {/* Delete School */}
      <DeletePopup
        title="Remove Course"
        description="Are you sure you want to remove the course?"
        open={courseDeleteDialog}
        setOpen={setCourseDeleteDialog}
        handleDelete={handleCourseDelete}
      />
    </div>

  );
};

export default Global;
