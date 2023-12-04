import RouteLayout from '@layout/routeLayout';
import Checkbox from '@component/checkbox';
import PageTitle from '@shared/pageTitle';
import { useCallback, useState, useEffect } from 'react';
import Button from '@component/button/button';
import { useParams } from 'react-router-dom';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { useSelector } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useGet, usePost } from '@shared/api/useApi';
import FormControlLabel from '@mui/material/FormControlLabel';
import Loader from '@shared/loader';
import toast from '@shared/toast';

export default function AssignStudent(props: any) {
  const { parentData, toggleDialog, fetchParent } = props;

  const { id, branchId } = useParams();
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const schooID = id || branchData?.school_id;
  const [page, setPage] = useState<number>(1);
  const [classArray, setClassArray] = useState<any>([]);
  const [selectedClass, setSelectedClass] = useState<string[]>(parentData?.class_name_id);

  const [studentsArray, setStudentsArray] = useState<any>([]);
  const [selectedStudent, setSelectedStudent] = useState<string[]>([]);

  const handleSave = () => {
    const payload = {
      parent_id: parentData?.user_id,
      school_id: schooID,
      branch_id: branchId || '',
      student_ids: selectedStudent
    };
    mutateAssign(payload);
  };
  // --------------------------------API------------------------------------------
  // Get Classes
  const { isFetching: isLoading1, data: data1 } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-classes/?school_id=${schooID}&branch_name=${branchData?.name || parentData?.branch_name || ''}&ordering=-created_at&limit=30 &offset=${(page - 1) * 30}`,
    onSuccess: (res: any) => {
      const newArray = res?.data?.response?.results?.map((item: any) => ({ label: item.name, value: item.id }));
      setClassArray([...classArray, ...newArray]);
    },
    onError: () => { },
    enabled: Boolean(id ? true : (branchId ? (branchData?.name) : false))
    // enabled: Boolean(schooID)
  });

  // Get Students From Class
  const { isLoading: isLoading2, mutate: mutateData } = usePost({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/class-students/`,
    onSuccess: (res: any) => {
      const newArray = res?.data?.response?.results?.map((item: any) => ({
        label: `${item.first_name} ${item.last_name}`, value: item.user_id_id
      }));
      setStudentsArray(newArray);
    },
    onError: () => { },
    enabled: false
  });

  // POST : Assign Student to class
  const { isLoading: LoadAssign, mutate: mutateAssign } = usePost({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/assign-students-to-parents/`,
    onSuccess: (res: any) => {
      if (selectedStudent.length) {
        fetchParent();
        toast('success', 'Student Assigned Successfully');
      } else {
        toast('success', 'No student assign to parent');
      }
      toggleDialog(false);
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    },
    enabled: false
  });

  // ----------------------END API--------------------------------------

  const onClassSelect = useCallback((value: string) => {
    if (selectedClass.includes(value)) {
      setSelectedClass(selectedClass.filter((ele: string) => ele !== value));
    } else {
      setSelectedClass([...selectedClass, value]);
    }
  }, [selectedClass]);

  const onStudentSelect = useCallback((value: string) => {
    if (selectedStudent.includes(value)) {
      setSelectedStudent(selectedStudent.filter((ele: string) => ele !== value));
    } else {
      setSelectedStudent([...selectedStudent, value]);
    }
  }, [selectedStudent]);

  const classCheckboxes = (
    <div className="h-[300px] w-full overflow-auto bg-white border border-linegray rounded" id="classScroll">
      <InfiniteScroll
        scrollableTarget="classScroll"
        dataLength={data1?.data?.response?.count || 0} // This is important field to render the next data
        next={() => setPage((prev: number) => prev + 1)}
        hasMore={!!data1?.data?.response?.next}
        loader=""
        endMessage={classArray.length > 10 && data1?.data?.response?.next && (
          <p className="text-center">
            <i>No more data</i>
          </p>
        )}
      >
        <div
          className="p-6 grid justify-start items-start grid-cols-3 gap-5"
        >
          {
            classArray?.map((item: any) => {
              const checked = selectedClass.includes(item?.value);
              return (
                <FormControlLabel
                  key={item.value}
                  className="hover:bg-gray-100 "
                  control={(
                    <Checkbox
                      sx={{
                        paddingTop: '3px'
                      }}
                      checked={checked}
                      size="small"
                      onChange={() => onClassSelect(item.value)} />
                  )}
                  label={
                    <span
                      role="presentation"
                      className="cursor-pointer text-sm font-light"
                      style={{
                        wordBreak: 'break-word'
                      }}
                    >
                      {item.label}
                    </span>
                  }
                  sx={{
                    alignItems: 'flex-start'
                  }}
                />
              );
            })
          }
        </div>
      </InfiniteScroll>
      {
        isLoading1 && <Loader size={20} />
      }
      {
        !classArray.length && !isLoading1
          ? (
            <div className="alignCenter">
              <i>No Classes found</i>
            </div>
          )
          : null
      }
    </div>
  );

  const studentCheckboxes = (
    <div
      className="w-full overflow-auto border border-linegray rounded h-[300px] "
    >
      {
        !studentsArray.length && !isLoading2
          ? (
            <div className="alignCenter">
              <i>No Students found</i>
            </div>
          )
          : null
      }
      <div className="p-6 grid justify-start items-start grid-cols-3 gap-5 ">
        {
            studentsArray.map((ele: any) => {
              const checked = selectedStudent.includes(ele?.value);
              return (
                <div className="flex items-start" key={ele?.value}>
                  <Checkbox
                    checked={checked}
                    size="small"
                    onChange={() => onStudentSelect(ele?.value)}
                    sx={{
                      paddingTop: '3px'
                    }}
                  />
                  <span
                    role="presentation"
                    onClick={() => onStudentSelect(ele?.value)}
                    className="cursor-pointer text-sm font-light capitalize"
                  >
                    {ele?.label}
                  </span>
                </div>
              );
            })
          }
      </div>

      {
          isLoading2 && <Loader size={20} />
        }
    </div>
  );

  useEffect(() => {
    if (selectedClass.length && classArray.length) {
      const payload = {
        school_id: id || branchData?.school_id,
        branch_id: branchId || parentData?.branch_id,
        assigned_classes_id: selectedClass
      };
      mutateData(payload);
    } else {
      // setSelectedStudent([]);
      setStudentsArray([]);
    }
  }, [selectedClass, classArray]);

  useEffect(() => {
    if (Object.keys('parentData').length) {
      setSelectedStudent(parentData?.student_id);
    }
  }, [parentData]);

  return (
    <RouteLayout navBack={false}>
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <PageTitle
            title={`${id ? schoolData?.school_name : `${branchData?.school_data?.school_name} | ${branchData?.name}`}`}
          />
          <div className="font-semibold flex gap-x-2">
            <span>Parent : </span>
            <span className="text-sunlight">
              {parentData?.first_name}
              {' '}
              {parentData?.last_name}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-2 lg:gap-x-6 mt-1">
          <div>
            <p className="pb-2.5">Select Class</p>
            {classCheckboxes}
          </div>
          <div>
            <p className="pb-2.5">Select Student</p>
            {studentCheckboxes}
          </div>
        </div>
        <div className="col-span-3 flex gap-x-4 items-center justify-end pt-10">
          <Button loading={LoadAssign} onClick={handleSave}>Save</Button>
        </div>
      </div>
    </RouteLayout>
  );
}
