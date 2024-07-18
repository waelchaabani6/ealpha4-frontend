import { useEffect, useState } from 'react';
import { CustomInput } from '@component/input';
import CheckBox from '@component/checkbox';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import Dropdown from '@component/dropdown/Dropdown';
import Button from '@component/button/button';
import { useSelector } from 'react-redux';
import { usePost, useGet } from '@shared/api/useApi';
import { selectUser } from '@shared/store/userSlice';
import { USER_TYPE, SELECT_TYPE, ASSIGNMENT_MODE } from '@constants/constants';
import Select from '@component/dropdown/select';
import { selectSchoolData } from '@shared/store/schoolSlice';
import toast from '@shared/toast';
import { sortData } from '@utility/utility';

const userServiceUrl = import.meta.env.VITE_APP_USER_SERVICE_URL;
const schoolServiceUrl = import.meta.env.VITE_APP_SCHOOL_SERVICE_URL;
const digitalLibraryServiceUrl = import.meta.env.VITE_APP_DIGITAL_LIBRARY_SERVICE_URL;

type AddEditFolder = { refetchFolderList: any; refetchNestedFolderList: any; folderID: any; fileType: string; selectedFolderFileId: number | undefined; isOpen: boolean; title: string; setOpen: (isOpen: boolean) => void }
type TeacherType = { label: string; value: string; id?: number; user_id?: number }
type ShareDataType = { class_id?: number[]; folder_access?: number; user_id?: number[]; group_id?: number[]; file_access?: number };

const AddEditFolder = ({ isOpen, title, setOpen, fileType, selectedFolderFileId, refetchFolderList, refetchNestedFolderList, folderID } : AddEditFolder) => {
  const [folderName, setFolderName] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedValue, setSelectedValue] = useState('');
  const [TeacherClassesArray, setTeacherClassesArray] = useState<any>([]);
  const { schoolId, branchId, user_profile_id: userID, role, userId, branch_name, school_name, class_name } = useSelector(selectUser);
  const [teachers, setTeachers] = useState<TeacherType[]>([]);
  const [selectedTeachersForStudent, setTeacherForStudent] = useState<string>('');
  const [groupsData, setGroupsData] = useState([]);
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const [ClassId, setClassId] = useState<any>(-1);
  const [idLots, setIdLots] = useState<any>([]);
  const [selectClassArray, setSelectClassArray] = useState<any>([]);
  const [selectClass, setSelectClass] = useState('');
  const [shareObject, setShareObject] = useState<ShareDataType | null>(null);
  const [branchName, setBranchName] = useState('');
  const [branchID, setBranchID] = useState('');
  const [BranchArray, setBranchArray] = useState<any>([]);
  const [disableBranchButton, setDisableBranchButton] = useState(false);
  const [selectedBranch, setselectedBranch] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (branch_name) {
      setBranchName(branch_name);
    }
    if (branchId) {
      setBranchID(branchId);
    }
  }, [branch_name, branchId]);

  useEffect(() => {
    if (selectedType !== '') {
      if (selectedType === 'My Group') {
        fetchMyGroups();
      } else if (role.name === USER_TYPE.TEACHER) {
        ClassesForTeacher({
          teacher_id: userID
        });
      } else {
        refetchData();
      }
    }
  }, [selectedType]);

  useEffect(() => {
    if (selectedType === SELECT_TYPE.STUDENT) {
      studentslist();
    }
  }, [selectedType]);

  useEffect(() => {
    if (shareObject) {
      fetchShareLib(shareObject);
    }
  }, [shareObject]);

  // users-service/teachers-list/?school_id=3&limit=10&offset=0&ordering=-created_at&search=&class_name=&branch_name=Trinity%20School%20Branch
  useGet({
    baseURL: schoolServiceUrl,
    url: `schools-service/school-branches/?limit=100&school_id=${role.name === USER_TYPE.SCHOOL_ADMIN ? schoolId : branchData?.school_data?.id}&offset=0&ordering=asc`,
    onSuccess: (resp: any) => {
      const accData = resp?.data?.response;
      const respData = accData?.results;
      const branchArray: never[] = respData.map((i: any) => ({
        label: i?.name,
        value: i?.name,
        id: i?.id
      }));
      branchArray.sort(sortData);
      if (branchArray.length) {
        setBranchArray([{ label: 'Select', value: '', id: null }, ...branchArray]);
      } else {
        setBranchArray([{ label: school_name, value: school_name, id: null }, ...branchArray]);
        setselectedBranch(school_name);
        setDisableBranchButton(true);
      }
    },
    enabled: role.name === USER_TYPE.SCHOOL_ADMIN || role.name === USER_TYPE.BRANCH_ADMIN
  });

  const { refetch: refetchTeacherList } = useGet({
    baseURL: userServiceUrl,
    url: `users-service/teachers-list/?school_id=${schoolId}&limit=100&offset=0&ordering=-created_at${branchName ? `&branch_name=${branchName}` : ''}`,
    onSuccess: (resp: any) => {
      const accData = resp?.data?.response;
      const respData = accData?.results;
      const tempIdLots: TeacherType[] = [];
      if (respData?.length) {
        respData.forEach((ele: any) => {
          if ((role.name !== USER_TYPE.STUDENT) || (role.name === USER_TYPE.STUDENT && class_name && (ele?.class_name.includes(class_name)))) {
            tempIdLots.push({
              label: `${ele.first_name} ${ele.last_name}`,
              value: `${ele.first_name} ${ele.last_name}`,
              id: ele.id,
              user_id: ele.user_id
            });
          }
        });
      }
      setTeachers([...tempIdLots]);
    },
    enabled: !!(role.name === USER_TYPE.STUDENT || role.name === USER_TYPE.SCHOOL_ADMIN || role.name === USER_TYPE.BRANCH_ADMIN)
  });

  const { isLoading: loadingStudentIdS, refetch: studentslist } = useGet({
    baseURL: userServiceUrl,
    url: `users-service/students/assigned/?${branchID ? `branch_id=${branchID}&` : ''}${schoolId ? `school_id=${(role.name === USER_TYPE.SCHOOL_ADMIN || role.name === USER_TYPE.TEACHER) ? schoolId : branchData?.school_data?.id}` : ''}${ClassId && ClassId !== -1 ? `&class_id=${ClassId}` : ''}`,
    onSuccess: (resp: any) => {
      const accData = resp?.data?.response;
      const respData = accData?.results;
      const tempIdLots: { label: string; value: string; id: number; user_id: number; isChecked: boolean }[] = [];
      if (respData?.length) {
        respData.forEach((ele: any) => {
          tempIdLots.push({
            label: `${ele.first_name} ${ele.last_name}`,
            value: `${ele.first_name} ${ele.last_name}`,
            id: ele.id,
            user_id: ele.user_id_id,
            isChecked: false
          });
        });
        setError('');
      } else {
        setError('Student\'s are not present in the class');
      }

      setIdLots([...tempIdLots]);
    },
    enabled: !!(selectedType === SELECT_TYPE.STUDENT)
  });

  const { isLoading: loadClassesForTeacher, mutate: ClassesForTeacher } = usePost({
    baseURL: schoolServiceUrl,
    url: `schools-service/school-classes/teacher/assigned-class`,
    onSuccess: (resp: any) => {
      const res = resp?.data?.response;
      const formatArr = res?.map((ele: any) => ({ label: ele.name, value: ele.name, id: ele.class_id })) || [];
      setTeacherClassesArray([...formatArr]);
    },
    enabled: false
  });

  const { isLoading, refetch: refetchData } = useGet({
    baseURL: schoolServiceUrl,
    url: `schools-service/school-classes/?limit=1000&school_id=${schoolId}${branchName ? `&branch_name=${branchName}` : ''}${(role.name === USER_TYPE.BRANCH_ADMIN && branchData?.id) ? `&branch_id=${branchData?.id}` : ``}`,
    onSuccess: (resp: any) => {
      const accData = resp?.data?.response?.results;
      const tempClassData: { label: string; value: string; id: number }[] = [];
      if (accData?.length) {
        accData.forEach((ele: any) => {
          tempClassData.push({
            label: ele.name,
            value: ele.name,
            id: ele.id
          });
        });
      }
      tempClassData.sort((a: any, b: any) => a.value.localeCompare(b.value));
      setTeacherClassesArray([...tempClassData]);
    },
    onError: ({ response }: any) => {
    }
  });

  const { isLoading: loadMyGroups, refetch: fetchMyGroups } = useGet({
    baseURL: userServiceUrl,
    url: `users-service/groups-list/?limit=1000&offset=0`,
    onSuccess: (response: any) => {
      const data = response?.data?.response?.results;
      const arr: any = [];
      data?.map((item: any) => {
        arr.push(
          {
            label: item?.group_name,
            value: item?.id
          }
        );
        return arr;
      });
      setGroupsData(arr);
    },
    enabled: false
  });

  const { mutate: fetchShareLib } = usePost({
    baseURL: digitalLibraryServiceUrl,
    url: `digital-library/access/`,
    onSuccess: (response: any) => {
      toast('success', response?.data?.message || 'Access given successfully');
      if (folderID) {
        refetchNestedFolderList();
      } else {
        refetchFolderList();
      }
    },
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Error');
    },
    enabled: false
  });

  const handleChangeMultiSelect = (event: any) => {
    setSelectClassArray(event?.target?.value);
  };

  const commonCode = (shareObj: ShareDataType) => {
    if (fileType === 'Folder') {
      shareObj.folder_access = selectedFolderFileId;
    }
    if (fileType === 'File') {
      shareObj.file_access = selectedFolderFileId;
    }
    setShareObject(shareObj);
    setError('');
    handleClose();
  };

  const handleFileShare = () => {
    if (role.name === USER_TYPE.STUDENT) {
      const teacherId = teachers.find((ele: TeacherType) => ele.label === selectedTeachersForStudent);
      const shareObj: ShareDataType = {};
      if (teacherId?.user_id) {
        shareObj.user_id = [teacherId.user_id];
        commonCode(shareObj);
      } else {
        setError('Please select teachers');
      }
    }
    if (role.name === USER_TYPE.TEACHER || role.name === USER_TYPE.SCHOOL_ADMIN || role.name === USER_TYPE.BRANCH_ADMIN) {
      const shareObj: ShareDataType = {};
      if (selectedType === SELECT_TYPE.CLASS) {
        if (selectClassArray.length) {
          shareObj.class_id = [...(TeacherClassesArray.map((ele: any) => (selectClassArray.includes(ele.label) ? ele?.id : '')).filter((ele: any) => ele))];
          commonCode(shareObj);
        } else {
          setError('Please select classes');
        }
      }
      if (selectedType === SELECT_TYPE.MYGROUP) {
        if (selectClass && Number(selectClass)) {
          shareObj.group_id = [Number(selectClass)];
          commonCode(shareObj);
        } else {
          setError('Please select group');
        }
      }
      if (selectedType === SELECT_TYPE.STUDENT) {
        const selectedStudents = idLots.map((ele: any) => (ele.isChecked ? ele.user_id : null)).filter((ele :any) => ele);
        if (selectedStudents.length) {
          shareObj.user_id = selectedStudents;
          commonCode(shareObj);
        } else {
          setError('Please select students');
        }
      }
      if (selectedType === SELECT_TYPE.TEACHER) {
        const teacherId = teachers.find((ele: TeacherType) => ele.label === selectedTeachersForStudent);
        if (teacherId?.user_id) {
          shareObj.user_id = [teacherId.user_id];
          commonCode(shareObj);
        } else {
          setError('Please select teachers');
        }
      }
    }
    setTeacherForStudent('');
  };

  const handleChangeClassGroup = (value: string) => {
    setSelectClass(value);
    const compareArray = selectedType === SELECT_TYPE.MYGROUP ? groupsData : TeacherClassesArray;
    setClassId(compareArray.find((ele: any) => ele.value === value)?.id);
  };

  const handleCheckboxChange = (event: any, ind: number) => {
    const tempIdLots = [...idLots];
    tempIdLots[ind].isChecked = event.target.checked;
    setIdLots(tempIdLots);
  };

  const handleClose = () => {
    setSelectedType('');
    setIdLots([]);
    setSelectClass('');
    setOpen(false);
    setselectedBranch('');
    setClassId(-1);
    setError('');
    setTeacherForStudent('');
  };

  const handleChangeBranch = (val: any) => {
    const obj: any = BranchArray.filter((ele: { label: any }) => ele.label === val)[0];
    if (obj) {
      setBranchID(obj.id);
      setselectedBranch(val);
      setBranchName(obj.label);
    } else {
      setClassId(-1);
      setselectedBranch('');
      setBranchID('');
    }
    setSelectedType('');
    setSelectClassArray([]);
    setSelectClass('');
    setError('');
  };

  const teacherArray = [
    { label: 'Select', value: '' },
    { label: SELECT_TYPE.CLASS, value: SELECT_TYPE.CLASS },
    { label: SELECT_TYPE.MYGROUP, value: SELECT_TYPE.MYGROUP },
    { label: SELECT_TYPE.STUDENT, value: SELECT_TYPE.STUDENT }
  ];
  if (role.name === USER_TYPE.SCHOOL_ADMIN || role.name === USER_TYPE.BRANCH_ADMIN) {
    teacherArray.push({ label: SELECT_TYPE.TEACHER, value: SELECT_TYPE.TEACHER });
  }

  const handleChangeSelectedType = (val: any) => {
    setSelectedType(val); setSelectClassArray([]); setIdLots([]); setSelectClass(''); setError('');
    if (USER_TYPE.SCHOOL_ADMIN === role.name) {
      refetchTeacherList();
    }
  };

  return (
    <CustomizedDialogs
      onclose={() => { handleClose(); }}
      open={isOpen}
      setOpen={() => { handleClose(); }}
      title={title}
      maxwidth="sm"
    >
      <div className="text-center">
        {role.name === USER_TYPE.SCHOOL_ADMIN && (
          <div className="my-5">
            <Dropdown
              dataArray={BranchArray}
              value={selectedBranch}
              title="Select Branch"
              sxClass={{ width: '100%', border: '1px solid #c4c4c4', textAlign: 'left' }}
              displayEmpty={false}
              labelParentClass="text-left relative top-[-5px]"
              onChangeHandler={handleChangeBranch}
            />
          </div>
        )}
        {role.name !== USER_TYPE.STUDENT && (
          <div className="my-5">
            <Dropdown
              dataArray={teacherArray}
              onChangeHandler={(val) => { handleChangeSelectedType(val); }}
              value={selectedType}
              title="Select Type"
              sxClass={{ width: '100%', border: '1px solid #c4c4c4', textAlign: 'left' }}
              displayEmpty={false}
              labelParentClass="text-left relative top-[-5px]"
            />
          </div>
        )}
        <div className="my-5">
          {(role.name === USER_TYPE.TEACHER || (((role.name === USER_TYPE.SCHOOL_ADMIN) || (role.name === USER_TYPE.BRANCH_ADMIN)) && selectedType !== SELECT_TYPE.TEACHER)) && (
          <>
            <div className={selectedType === SELECT_TYPE.CLASS ? '' : 'hidden'}>
              <Select
                ismultiple={true}
                name="select_class_array"
                label="Select Class"
                dataarray={TeacherClassesArray}
                displayEmpty={true}
                parentLabelClass="text-left"
                value={selectClassArray}
                onChange={handleChangeMultiSelect}
                sx={{ textAlign: 'left',
                  fontSize: '0.75rem',
                  color: 'black',
                  '.MuiSelect-select.MuiSelect-outlined.MuiSelect-multiple': {
                    position: 'relative',
                    bottom: '2px'
                  },
                  '.MuiOutlinedInput-notchedOutline legend': {
                    display: 'none'
                  } }}
                itemStyle={{ fontSize: '0.75rem' }}
                parentIconClass="relative right-3.5 bottom-1"
              />
            </div>
            <div className={selectedType !== SELECT_TYPE.CLASS ? '' : 'hidden'}>
              <Select
                name="select_class"
                parentLabelClass="text-left"
                label={selectedType === SELECT_TYPE.MYGROUP ? 'Select Group' : 'Select Class'}
                dataarray={selectedType === SELECT_TYPE.MYGROUP ? groupsData : TeacherClassesArray}
                value={selectClass}
                sx={{ textAlign: 'left',
                  fontSize: '0.75rem',
                  fontFamily: 'Montserrat-400',
                  color: 'black',
                  '.MuiSelect-select.MuiSelect-outlined': {
                    position: 'relative',
                    bottom: '2px'
                  },
                  '.MuiOutlinedInput-notchedOutline legend': {
                    display: 'none'
                  } }}
                onChange={(event: any) => { handleChangeClassGroup(event.target.value); }}
                parentIconClass="relative right-3.5 bottom-1"
                itemStyle={{ fontSize: '0.75rem' }}
              />
            </div>
          </>
          )}
          {(role.name === USER_TYPE.STUDENT || (((role.name === USER_TYPE.SCHOOL_ADMIN) || (role.name === USER_TYPE.BRANCH_ADMIN)) && selectedType === SELECT_TYPE.TEACHER)) && (
            <div className="relative top-[-10px]">
              <Select
                name="select_teacher"
                parentLabelClass="text-left"
                label="Select Teacher"
                dataarray={teachers}
                value={selectedTeachersForStudent}
                sx={{ textAlign: 'left',
                  fontSize: '0.75rem',
                  fontFamily: 'Montserrat-400',
                  color: 'black',
                  '.MuiSelect-select.MuiSelect-outlined': {
                    position: 'relative',
                    bottom: '2px'
                  },
                  '.MuiOutlinedInput-notchedOutline legend': {
                    display: 'none'
                  } }}
                onChange={(event: any) => { setTeacherForStudent(event.target.value); }}
                parentIconClass="relative right-3.5 bottom-1"
                itemStyle={{ fontSize: '0.75rem' }}
              />
            </div>)}
        </div>

        <div className={`relative grid sm:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 max-h-60 overflow-y-auto ${selectedType === SELECT_TYPE.STUDENT && selectClass && idLots.length !== 0 ? 'border' : ''} border-black`}>
          {(role.name === USER_TYPE.SCHOOL_ADMIN || role.name === USER_TYPE.TEACHER || role.name === USER_TYPE.BRANCH_ADMIN) && selectedType === SELECT_TYPE.STUDENT && selectClass && idLots.map((ele: any, ind: number) => (
            <div key={ind} className="text-left">
              <CheckBox
                onChange={(e: any) => handleCheckboxChange(e, ind)}
                checked={ele.isChecked}
              />
              <span className="text-sm">{ele.label}</span>
            </div>
          ))}
        </div>
        {error && (
        <div className="text-red-500 text-left text-[0.75rem]">
          {' '}
          {error}
          {' '}
        </div>)}
        <div className="mt-2">
          <Button onClick={() => { handleFileShare(); }}> Ok </Button>
        </div>
      </div>
    </CustomizedDialogs>
  );
};

export default AddEditFolder;
