// SignInToClassroomForm

/* eslint-disable comma-dangle */
import * as React from 'react';

import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import { TABLE_LABELS } from '@constants/constants';
import Wrapper from '@shared/wrapper/Wrapper';
import Button from '@component/button/button';
import toast from '@shared/toast';
import { usePost } from '@shared/api/useApi';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectSchoolData } from '@shared/store/schoolSlice';

export default function GoogleClassroomList({ data }: any) {
  const { schoolData } = useSelector(selectSchoolData);

  const [tableData, setTableData] = React.useState<any>([]);

  const schoolServiceBaseURL = import.meta.env.VITE_APP_SCHOOL_SERVICE_URL;

  const componentRef = React.useRef(null);

  const TableColumns = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center',
      mapper: 'id',
    },
    {
      label: TABLE_LABELS?.CLASSROOM_NAME,
      mapper: 'name',
      isSort: true,
      align: 'center',
    },
  ];

  React.useEffect(() => {
    console.log('object', data);
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

    const body: any = [];
    // data?.map((i: any) => {
    //   body.push({
    //     name: i.name,
    //     school_id: schoolData.id,
    //     class_source: 'google_classroom',
    //   });
    //   return true;
    // });

    data?.map((i: any) => {
      const dt = {
        name: i.name,
        school_id: schoolData.id,
        class_source: 'google_classroom',
      };
      mutateAddClass(dt);
      return true;
    });

    // const dt = {
    //   name: data[0].name,
    //   school_id: schoolData.id,
    //   class_source: 'google_classroom',
    // };
    // mutateAddClass(dt);
    // mutateAddClass(body);
    return false;
  };

  return (
    <div className=" m-auto">
      <div className="mt-3" ref={componentRef}>
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
          />
        </Wrapper>
      </div>

      <div className="text-right">
        <Button onClick={addClassHandler}>Submit</Button>
      </div>
    </div>
  );
}
