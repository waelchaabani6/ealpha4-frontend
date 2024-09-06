// SignInToClassroomForm

/* eslint-disable comma-dangle */
import * as React from 'react';

import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import { COMPONENTS, TABLE_LABELS } from '@constants/constants';
import Wrapper from '@shared/wrapper/Wrapper';
import Button from '@component/button/button';
import toast from '@shared/toast';
import { usePost } from '@shared/api/useApi';
// import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectSchoolData } from '@shared/store/schoolSlice';

export default function GoogleClassroomList({ data }: any) {
  const { schoolData } = useSelector(selectSchoolData);

  const [tableData, setTableData] = React.useState<any>([]);
  const [bulkSelect, setBulkSelect] = React.useState<any>([]);

  const schoolServiceBaseURL = import.meta.env.VITE_APP_SCHOOL_SERVICE_URL;

  const componentRef = React.useRef(null);

  const TableColumns = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center',
      mapper: 'id',
    },
    {
      label: 'Select',
      mapper: 'Select',
      component: COMPONENTS?.checkbox,
      selector: 'id',
      showInHeader: true,
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
    {
      label: TABLE_LABELS?.CLASSROOM_NAME,
      mapper: 'name',
      isSort: true,
      align: 'center',
    },
  ];

  React.useEffect(() => {
    // console.log('object', data);
    setTableData(data);
  }, [data]);

  // Add New Class
  const { isLoading: AddClassLoader, mutate: mutateAddClass } = usePost({
    baseURL: schoolServiceBaseURL,
    url: 'schools-service/school-classes/',
    onSuccess: (res: any) => {
      toast('success', res?.data?.message || 'School Class Created');
    },
    onError: (res: any) => {
      const errMessage = res?.response?.data?.message;
      toast('error', errMessage || 'Error');
    },
  });

  const addClassHandler = () => {
    if (!data) {
      return toast('error', 'Please enter class name');
    }

    data?.map((i: any) => {
      let dt = {};
      const obj = bulkSelect.find((bid: any) => i?.id === bid);
      if (obj) {
        dt = {
          name: i.name,
          school_id: schoolData.id,
          class_source: 'google_classroom',
        };
        mutateAddClass(dt);
      }

      return true;
    });

    return false;
  };

  const handleSelection = (params: any) => {
    setBulkSelect(params);
  };

  return (
    <div className=" m-auto">
      <div className="wrapperBorder mt-3" ref={componentRef}>
        <Wrapper>
          <AdvanceTable
            tableData={tableData}
            headerRows={TableColumns}
            // totalPages={noOfpages}
            // paginateHandler={handlePagination}
            // currentPage={page}
            // setPage={setPage}
            // rowsPerPage={rowsPerPage}
            // orderBy={orderBy}
            // setOrderBy={setOrderBy}
            // order={order}
            // setOrder={setOrder}
            // actionHandler={actionHandler}
            // isLoading={assignmentLoading}
            setBulkSelect={handleSelection}
            maxHeight={620}
            bulkSelect={bulkSelect}
          />
        </Wrapper>
      </div>
      {tableData && tableData.length > 0 && (
        <div className="text-right mt-4">
          <Button onClick={addClassHandler}>Import classrooms</Button>
        </div>
      )}
    </div>
  );
}
