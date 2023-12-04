import React, { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import { CustomInput } from '@component/input';
import Button from '@component/button/button';
import Checkbox from '@mui/material/Checkbox';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import Loader from '@shared/loader';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/en-gb';
import Dropdown from '@component/dropdown/Dropdown';
import './customTimetable.css';
import RouteLayout from '@layout/routeLayout';
import { useGet, usePost, usePatch, useDelete } from '@shared/api/useApi';
import FileSelect from '@component/fileUpload';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { useSelector } from 'react-redux';
import { selectUser } from '@shared/store/userSlice';
import toast from '@shared/toast';
import PrintIcon from '@mui/icons-material/Print';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { TOOLBAR_LABELS, MAX_TIME, START_TIME } from '@constants/constants';
import ReactToPrint from 'react-to-print';
import DatePicker from '@component/datepicker';
import { debounce } from '@constants/helperMethods';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import events from './events';
import CustomeDateRange from './CustomeDateRange';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import CustomeTimePicker from '../../components/TimePicker';
import DelteConfirmationPopup from './DeletePopup';

const SCHOOL_SERVICE = import.meta.env.VITE_APP_SCHOOL_SERVICE_URL;
const ROASTER_SERVICE = import.meta.env.VITE_APP_ROSTER_SERVICE_URL;

type SelectTypeI = {
  label: string;
  value: string;
  id: null | number;
}

const SelectType: SelectTypeI = {
  label: 'Select',
  value: 'Select',
  id: 0
};

const DnDCalendar = withDragAndDrop(Calendar);
moment.locale('en-GB');
const localizer = momentLocalizer(moment);

moment.locale('en-GB', {
  week: {
    dow: 1 // Monday is the first day of the week.
  }
});

type EventTypeData = {
  title: string;
  start: Date;
  end: Date;
  hexColor?: string;
}
const today = new Date();
const plus7 = new Date(new Date().setDate(new Date().getDate() + 7));

export default function Index() {
  const componentRef = useRef(null);
  const [eventsData, setEventsData] = useState<Array<EventTypeData>>(events);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courseId, setSelectedCourseId] = useState(null);
  const [selectedTimeFrom, setSelectedTimeFrom] = useState<any>(null);
  const [selectedTimeTo, setSelectedTimeTo] = useState<any>(null);
  const [timeStart, setTimeStart] = useState(new Date());
  const [DragEventObj, setDragEventObj] = useState<any>('');
  const [updateCounter, setUpdateCounter] = useState(0);
  const [schoolTimetableEvent, SetSchoolTimetablePopup] = useState(false);
  const [desiderPopup, SetDesiderPopup] = useState(false);
  const [PrevEventObj, setPrevEventObj] = useState<any>(null);

  const [isHolidayCheck, setHolidayCheck] = useState(false);
  const [isSchollTimetableCheck, setSchollTimetableCheck] = useState(false);

  const [resonForHoliday, setResonForHoliday] = useState('');
  const [markAsHolidayPopup, setMarkAsHolidayPopup] = useState(false);
  const [BranchArray, setBranchArray] = useState<any>([]);
  const [SchoolArray, setSchoolArray] = useState<any>([]);
  const [ClassesArray, setClassesArray] = useState<any>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedBranch, setselectedBranch] = useState('');
  const { user_profile_id: userID, role } = useSelector(selectUser);
  const { branchData } = useSelector(selectSchoolData);
  const [startDate, setStartDate] = useState(moment(today).utc().format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment(plus7).utc().format('YYYY-MM-DD'));
  const [classId, setClassId] = useState(-1);
  const [branchId, setBranchId] = useState(-1);
  const [dateApplied, setDateApplied] = useState(false);
  const [courses, setCourses] = useState<any>([]);
  const [teachers, setTeachers] = useState<any>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<any>('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<any>(null);
  const [updateHolidayPopup, setUpdateHolidayPopup] = useState(false);
  const [updateTimetableId, setUpdateTimetableId] = useState(-1);
  const [selectedEvent, setSelectedEvent] = useState<any>({});
  const [HolidayError, setHolidayError] = useState<any>(false);
  const [showToError, setShowToError] = useState<any>(false);
  const [showFromError, setshowFromError] = useState<any>(false);
  const [showCourseError, setShowCourseError] = useState<any>(false);
  const [showTeacherError, setShowTeacherError] = useState<any>(false);
  const [actionConfirmPopup, setActionConfirmPopup] = useState(false);
  const [ConfirmDelete, setConfirmDelete] = useState(false);
  const [eventObj, setEventObj] = useState<any>(null);
  const [navigationDate, setNaviagationDate] = useState(new Date());
  const [schoolId, setSchoolId] = useState(0);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedSchoolBranchCount, setSelectedSchoolBranchCount] = useState(0);
  const [startTime, setStartTime] = useState(START_TIME);

  const updateHolidateMsg = () => {
    setHolidayError(false);
    if (resonForHoliday === '') {
      setHolidayError(true);
    } else if (updateHolidayPopup) {
      updateHolidayForSelectedDay();
    } else {
      submitHolidayForSelectedDay();
    }
  };

  const checkIfNoSlotBooked = (newSlot: { start: any; end: any }) => {
    const exhistingDate = eventsData.filter((ele) => new Date(ele.start).toDateString() === new Date(newSlot.start).toDateString());
    let isValid = true;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < exhistingDate.length; i++) {
      const e1start = new Date(exhistingDate[i].start).getTime();
      const e1end = new Date(exhistingDate[i].end).getTime();
      const e2start = new Date(newSlot.start).getTime();
      const e2end = new Date(newSlot.end).getTime();
      // eslint-disable-next-line no-mixed-operators
      if ((e1start >= e2start && e1start < e2end || e2start >= e1start && e2start < e1end)) {
        isValid = false;
      }
    }
    return isValid;
  };

  const handleSelect = (obj: { start: Date; end: Date }) => {
    const { start, end } = obj;
    if (checkIfNoSlotBooked(obj)) {
      setSelectedTimeFrom(start);
      setSelectedTimeTo(end);
      setTimeStart(start);
      SetDesiderPopup(true);
    }
  };
  const printButton = () => <PrintIcon />;

  const ADMIN_TOOLBAR_MENU = [
    {
      title: TOOLBAR_LABELS.PRINT,
      icon: <ReactToPrint
        trigger={printButton}
        content={() => componentRef.current}
      />
    }
  ];

  const handleToolbarAction = (title: string) => {
    if (title === TOOLBAR_LABELS.IMPORT) {
      importData();
    } else if (title === TOOLBAR_LABELS.EMAIL) {
      handelSendEmail();
    }
  };
  const handelSendEmail = () => {
    // fetchEmailApi();
  };
  const importData = async () => {
    const input: any = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = () => {
      const file = input?.files?.[0];
      const fileType = file.name.split('.').pop();
      if (fileType === 'csv') {
        const documentFormData: any = new FormData();
        documentFormData.append('csv_file', file);
        documentFormData.append('import_type', 'sub-admin');
        // mutateImport(documentFormData);
      } else {
        toast('error', 'Please upload CSV filetype only');
      }
    };
    input.click();
  };

  const handleSelectEvent = (event: any) => {
    if (event.is_holiday === true) {
      setSelectedEvent({
        is_holiday: true,
        reason: event.reason,
        for_date: moment(event.time_from.replace('Z', '')).format('YYYY-MM-DD'),
        time_blocks: [{
          id: event.id,
          subject: event.subject,
          branch_id: event.branch_id,
          course: event.course,
          school_class: event.school_class,
          teacher: event.teacher,
          time_from: moment(event.time_from.replace('Z', '')).format('YYYY-MM-DD HH:mm'),
          time_to: moment(event.time_to.replace('Z', '')).format('YYYY-MM-DD HH:mm')
        }]
      });
      setUpdateTimetableId(event.mainEventId);
      setResonForHoliday(event.reason);
      setUpdateHolidayPopup(true);
      setMarkAsHolidayPopup(true);
    } else {
      SetSchoolTimetablePopup(true);
      setUpdateHolidayPopup(true);
      setUpdateTimetableId(event.mainEventId);

      setSelectedCourseId(event.subject);
      setSelectedCourse(event.subject_name);

      setSelectedTeacher(event.teacher_name);
      setSelectedTeacherId(event.teacher);

      setSelectedTimeFrom((new Date(event.time_from.replace('Z', ''))));
      setSelectedTimeTo((new Date(event.time_to.replace('Z', ''))));

      setSelectedEvent({ ...event });
    }
  };

  const handleUpdateDialogClick = () => {
    const isValid = validationCheck();
    if (isValid === false) {
      return;
    }

    const Start = moment(selectedEvent.start).toDate();
    const timeFrom = new Date(selectedTimeFrom.$d ? selectedTimeFrom.$d : selectedTimeFrom);
    const timeTo = new Date(selectedTimeTo.$d ? selectedTimeTo.$d : selectedTimeTo);
    timeFrom.setDate(Start.getDate());
    timeTo.setDate(Start.getDate());

    const patchEvent: any = {
      is_holiday: false,
      reason: selectedCourse,
      for_date: moment(timeFrom).format('YYYY-MM-DD'),
      class_id: classId,
      school_id: schoolId,
      created_by: userID,
      updated_by: userID,
      branch_id: branchId,
      time_blocks: [
        {
          id: selectedEvent.id,
          branch_id: branchId,
          course: 0,
          subject: courseId,
          school_class: selectedEvent.school_class,
          teacher: selectedTeacherId,
          teacher_name: selectedTeacher,
          time_from: moment(timeFrom).format('YYYY-MM-DD HH:mm'),
          time_to: moment(timeTo).format('YYYY-MM-DD HH:mm'),
          subject_name: selectedCourse
        }
      ]
    };
    if (branchId === -1) {
      delete patchEvent.branch_id;
      delete patchEvent.time_blocks[0].branch_id;
    }
    patchTimeTableEvent(patchEvent);
    setUpdateHolidayPopup(false);
  };

  const validationCheck = () => {
    let isValid = true;
    if (selectedCourse === '') {
      setShowCourseError(true);
      isValid = false;
    } else {
      setShowCourseError(false);
    }
    if (selectedTeacher === '') {
      setShowTeacherError(true);
      isValid = false;
    } else {
      setShowTeacherError(false);
    }
    if (!selectedTimeFrom || selectedTimeFrom.$d === 'Invalid Date') {
      setshowFromError(true);
      isValid = false;
    } else {
      setshowFromError(false);
    }
    if (!selectedTimeTo || selectedTimeTo.$d === 'Invalid Date') {
      setShowToError(true);
      isValid = false;
    } else {
      setShowToError(false);
    }
    return isValid;
  };

  const handleOkDialogClick = () => {
    const isValid = validationCheck();
    if (isValid === false) {
      return;
    }
    SetSchoolTimetablePopup(false);

    const start = timeStart;
    const timeFrom = new Date(selectedTimeFrom.$d ? selectedTimeFrom.$d : selectedTimeFrom);
    const timeTo = new Date(selectedTimeTo.$d ? selectedTimeTo.$d : selectedTimeTo);

    timeFrom.setDate(timeStart.getDate());
    timeFrom.setMonth(timeStart.getMonth());
    timeFrom.setFullYear(timeStart.getFullYear());

    timeTo.setDate(timeStart.getDate());
    timeTo.setMonth(timeStart.getMonth());
    timeTo.setFullYear(timeStart.getFullYear());

    const postEvent: any = {
      is_holiday: false,
      reason: selectedCourse,
      for_date: moment(start).format('YYYY-MM-DD'),
      created_by: userID,
      updated_by: userID,
      class_id: classId,
      school_id: schoolId,
      branch_id: branchId,
      time_blocks: [
        {
          subject: courseId,
          branch_id: branchId,
          course: 0,
          school_class: classId,
          teacher: selectedTeacherId,
          teacher_name: selectedTeacher,
          time_from: moment(timeFrom).format('YYYY-MM-DD HH:mm'),
          time_to: moment(timeTo).format('YYYY-MM-DD HH:mm')
        }
      ]
    };
    if (branchId === -1) {
      delete postEvent.branch_id;
      delete postEvent.time_blocks[0].branch_id;
    }

    postTimeTableEvent(postEvent);

    setSelectedCourse('');
    setSelectedCourseId(null);
    setSelectedTeacherId(null);
    setSelectedTeacher('');
    setSchollTimetableCheck(false);
    setSelectedTimeFrom(null);
    setSelectedTimeTo(null);
  };

  const updateHolidayForSelectedDay = () => {
    patchTimeTableEvent({
      ...selectedEvent,
      reason: resonForHoliday
    });
    setMarkAsHolidayPopup(false);
    setUpdateHolidayPopup(false);
    setSelectedTimeFrom(null);
    setSelectedTimeTo(null);
  };

  const submitHolidayForSelectedDay = () => {
    setHolidayCheck(false);
    setSchollTimetableCheck(false);
    setMarkAsHolidayPopup(false);

    // Add Event for whole day
    const start = timeStart;
    start.setHours(6);
    start.setMinutes(0);

    const end = new Date(timeStart);
    end.setHours(18);
    end.setMinutes(0);

    setResonForHoliday('');
    // 17, 30
    const postEvent: any = {
      is_holiday: true,
      reason: resonForHoliday,
      for_date: moment(start).format('YYYY-MM-DD'),
      created_by: userID,
      updated_by: userID,
      class_id: classId,
      school_id: schoolId,
      branch_id: branchId,
      time_blocks: [
        {
          subject: 0,
          branch_id: branchId,
          course: 0,
          school_class: classId,
          teacher: 0,
          time_from: moment(start).format('YYYY-MM-DD hh:mm'),
          time_to: moment(end).format('YYYY-MM-DD HH:mm')
        }
      ]
    };
    if (branchId === -1) {
      delete postEvent.branch_id;
      delete postEvent.time_blocks[0].branch_id;
    }
    postTimeTableEvent(postEvent);
  };

  const { isLoading: fileUploadLoading, mutate: fileUploadPost } = usePost({
    baseURL: ROASTER_SERVICE,
    url: `roster-service/time-table/upload-excel/`,
    onSuccess: (response: any) => {
      toast('success', 'file uploaded successfully');
      refetchTimetable();
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    }
  });

  const onChange = (files: FileList) => {
    const file = files?.[0];
    const fileType = file.name.split('.').pop();

    if (fileType === 'xlsx') {
      const documentFormData: any = new FormData();
      documentFormData.append('timetable_sheet', file);
      documentFormData.append('school_id', schoolId);
      documentFormData.append('class_id', classId);
      if (branchId && branchId !== -1) {
        documentFormData.append('branch_id', branchId);
      }
      fileUploadPost(documentFormData);
    } else {
      toast('error', 'Please upload XLSX filetype only');
    }
  };

  useGet({
    baseURL: SCHOOL_SERVICE,
    url: `schools-service/schools/get-schools/?limit=1000&ordering=name`,
    onSuccess: (resp: any) => {
      const accData = resp?.data?.response;
      const respData = accData?.results;
      const schoolArray: never[] = respData.map((i: any) => ({
        label: i?.name,
        value: i?.name,
        id: i?.id,
        branch_count: i?.branch_count
      }));
      setSchoolArray([SelectType, ...schoolArray]);
    }
  });

  const { refetch: fetchBranch } = useGet({
    baseURL: SCHOOL_SERVICE,
    url: `schools-service/school-branches/?school_id=${schoolId}&offset=0&ordering=asc&limit=100`,
    onSuccess: (resp: any) => {
      const accData = resp?.data?.response;
      const respData = accData?.results;
      const branchArray: never[] = respData.map((i: any) => ({
        label: i?.name,
        value: i?.name,
        id: i?.id
      }));
      setBranchArray([SelectType, ...branchArray]);
    },
    enabled: false
  });

  //  Get Timetable
  const { isLoading: timetableLoading, data, refetch: refetchTimetable, isRefetching } = useGet({
    baseURL: ROASTER_SERVICE,
    url: dateApplied ? `roster-service/time_tables?class_id=${classId}${branchId === -1 ? '' : `&branch_id=${branchId}`}&start_date=${startDate}&end_date=${endDate}`
      : `roster-service/time_tables?class_id=${classId}${branchId === -1 ? '' : `&branch_id=${branchId}`}`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response || [];
      let eventData: any[] = [];
      let tempStartTime = MAX_TIME;
      if (resp.length) {
        resp.forEach((dateData: any) => {
          if (dateData.time_blocks && dateData.time_blocks.length !== 0) {
            dateData.time_blocks = dateData.time_blocks.map((ele: { is_holiday: any; course_name: string; subject_name: string }) => ({ ...ele, is_holiday: dateData.is_holiday, reason: dateData.is_holiday ? dateData?.reason : ele?.subject_name, mainEventId: dateData.id }));
            eventData = [...eventData, ...dateData.time_blocks];
          }
        });
      }
      eventData = eventData.map((ele, index) => {
        let hexColor = ele.is_holiday === true ? '#94A3B8' : '#b0db77';
        if (ele.time_from && moment(new Date(ele.time_from)).isValid() && (moment(ele.time_from).day() === 0 || moment(ele.time_from).day() === 6)) {
          hexColor = '#E07B5B';
        }
        if (!ele.is_holiday) {
          const hourValue = Number(moment(new Date(ele.time_from?.replace('Z', ''))).format('HH'));
          tempStartTime = hourValue < tempStartTime ? hourValue : tempStartTime;
        }
        return ({
          ...ele,
          id: ele.id,
          mainEventId: ele.mainEventId,
          reason: ele.reason,
          is_holiday: ele.is_holiday,
          currentIndex: index,
          title: ele.reason,
          start: new Date(ele.time_from?.replace('Z', '')),
          end: new Date(ele.time_to?.replace('Z', '')),
          hexColor
        });
      });
      setEventsData(eventData);
      tempStartTime = tempStartTime === MAX_TIME ? START_TIME : tempStartTime;
      setStartTime(tempStartTime);
    },
    onError: ({ response }: any) => { },
    enabled: false
  });

  const { isLoading: postEventLoading, mutate: postTimeTableEvent } = usePost({
    baseURL: ROASTER_SERVICE,
    url: `roster-service/time_tables`,
    onSuccess: (response: any) => {
      if (response.data.success === false) {
        toast('error', response?.data?.errors?.time_blocks[0].non_field_errors[0]);
      } else {
        refetchTimetable();
      }
    },
    onError: ({ response }: any) => {
      toast('error', (response?.data ?? [])[0] || (response?.data?.errors?.date ?? [])[0] || (((response?.data?.errors?.time_blocks ?? [])[0]?.non_field_errors ?? [])[0]) || 'Error');
    }
  });

  const { isLoading: patchEventLoading, mutate: patchTimeTableEvent } = usePatch({
    baseURL: ROASTER_SERVICE,
    url: `roster-service/time_tables/${updateTimetableId}`,
    onSuccess: (response: any) => {
      refetchTimetable();
      SetSchoolTimetablePopup(false);
    },
    onError: ({ response }: any) => {
      toast('error', response?.data?.errors?.date[0] || response?.data?.errors?.time_blocks[0]?.non_field_errors[0] || 'Error');
      const tempEventData = eventsData.map((event: any) => {
        if (PrevEventObj.id === event.id) {
          event.start = PrevEventObj.start;
          event.end = PrevEventObj.end;
          return { ...event, start: event.start, end: event.end };
        }
        return { ...event };
      });
      setEventsData(tempEventData);
      SetSchoolTimetablePopup(false);
    }
  });

  const { mutate: mutateDeleteTimeBlock } = useDelete({
    baseURL: ROASTER_SERVICE,
    url: `roster-service/time_tables/delete`,
    onSuccess: (response: any) => {
      refetchTimetable();
      setConfirmDelete(false);
      toast('success', 'timeblock deleted successfully');
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    }
  });
  const { refetch: fetchClasses } = useGet({
    baseURL: SCHOOL_SERVICE,
    url: `schools-service/school-classes?school_id=${schoolId}${selectedBranch && selectedBranch !== 'Select' ? `&branch_name=${selectedBranch}` : ``}`,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response?.results;
      const temp2: { label: any; value: any; id: any }[] = [];
      respData?.map((i: any) => {
        temp2.push(
          {
            label: i?.name,
            value: i?.name,
            id: i?.id
          }
        );
        return temp2;
      });
      setClassesArray([SelectType, ...temp2]);
    },
    enabled: false,
    onError: () => { }
  });

  // Get Subjects
  const { isLoading: subjectLoading, refetch: refetchSubjects } = useGet({
    baseURL: SCHOOL_SERVICE,
    url: `schools-service/schools/subject/list/?class_id=${classId}`,
    enabled: false,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response;
      const temp3: { label: any; value: any; id: any }[] = [];
      respData?.map((i: any) => {
        temp3.push(
          {
            label: i?.name,
            value: i?.name,
            id: i?.id
          }
        );
        return temp3;
      });
      setCourses([...temp3]);
    }
  });

  const { refetch: refetchTeacher } = useGet({
    baseURL: SCHOOL_SERVICE,
    url: `schools-service/school-classes/teacher/get?class_id=${classId}&subject_id=${courseId}`,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response;
      const temp4: { label: any; value: any; id: any }[] = [];
      respData?.map((i: any) => {
        temp4.push(
          {
            label: `${i?.teacher_name}`,
            value: `${i?.teacher_name}`,
            id: i?.user_profile_id
          }
        );
        return temp4;
      });
      setTeachers([...temp4]);
    },
    onError: () => { },
    enabled: false
  });

  useEffect(() => {
    if (classId !== -1 && courseId !== null) {
      refetchTeacher();
    }
  }, [courseId]);

  useEffect(() => {
    if (classId > -1) {
      refetchSubjects();
    }
  }, [classId]);

  // eslint-disable-next-line react/no-unstable-nested-components
  const MyLoader = () => (
    <div className="z-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <Loader />
    </div>
  );

  useEffect(() => {
    if (schoolId) {
      if (selectedSchoolBranchCount !== 0) {
        fetchBranch();
      } else {
        fetchClasses();
      }
    }
  }, [schoolId]);

  useEffect(() => {
    if (schoolId) {
      fetchClasses();
    }
  }, [selectedBranch, schoolId]);

  useEffect(() => {
    if (classId !== -1) {
      refetchTimetable();
    }
  }, [selectedBranch, classId, dateApplied]);

  const deleteDebounceTimeBlock = debounce(async () => {
    if (eventObj?.id) {
      const blockList = {
        blocks_list: [eventObj.id]
      };
      mutateDeleteTimeBlock(blockList);
    }
  }, 500);

  const onEventDrop = (dragEventObj: any) => {
    setUpdateTimetableId(dragEventObj.event.time_table_id);
    setDragEventObj(dragEventObj);
    // modify position.
    const prevEventObj: any = {};
    const tempEventData = eventsData.map((event: any) => {
      if (event.id === dragEventObj.event.id) {
        prevEventObj.start = event.start;
        prevEventObj.end = event.end;
        prevEventObj.id = event.id;
        return { ...event, start: dragEventObj.start, end: dragEventObj.end };
      }
      return { ...event };
    });
    setPrevEventObj(prevEventObj);
    setEventsData(tempEventData);
    setUpdateCounter((counter) => counter + 1);
  };

  useEffect(() => {
    if (updateCounter !== 0) {
      const patchEvent: any = {
        is_holiday: DragEventObj?.event?.is_holiday,
        reason: DragEventObj?.event?.reason,
        for_date: moment(DragEventObj?.start).format('YYYY-MM-DD'),
        class_id: classId,
        school_id: schoolId,
        created_by: userID,
        updated_by: userID,
        branch_id: branchId,
        time_blocks: [
          {
            id: DragEventObj?.event?.id,
            subject: DragEventObj?.event?.subject,
            branch_id: DragEventObj.event.branch_id,
            course: DragEventObj.event.course,
            school_class: DragEventObj.event.school_class,
            teacher: DragEventObj.event.teacher,
            teacher_name: DragEventObj.event.teacher_name,
            time_from: moment(DragEventObj.start).format('YYYY-MM-DD HH:mm'),
            time_to: moment(DragEventObj.end).format('YYYY-MM-DD HH:mm')
          }
        ]
      };
      if (branchId === -1) {
        delete patchEvent.branch_id;
        delete patchEvent.time_blocks[0].branch_id;
      }
      patchTimeTableEvent(patchEvent);
    }
  }, [updateCounter]);

  return (
    <div>
      <RouteLayout
        navBack={true}
      >
        <HeaderMenus
          title="School Timetable"
          menuArray={ADMIN_TOOLBAR_MENU}
          handleToolbarAction={handleToolbarAction}
        />
        {(timetableLoading || isRefetching) && <MyLoader />}
        {postEventLoading && <MyLoader />}
        {patchEventLoading && <MyLoader />}
        <CustomizedDialogs
          open={schoolTimetableEvent}
          setOpen={() => { SetSchoolTimetablePopup(false); setHolidayCheck(false); setSchollTimetableCheck(false); setUpdateHolidayPopup(false); setSelectedCourse(''); setSelectedTeacher(''); setShowCourseError(false); setShowTeacherError(false); setShowToError(false); setshowFromError(false); setSelectedTimeFrom(null); setSelectedTimeTo(null); }}
          title={(updateHolidayPopup ? 'Update School Timetable' : 'Add School Timetable')}
        >
          <div>
            <div className="text-center font-bold">
              {' '}
              {moment(timeStart).format('Do MMMM YYYY, dddd')}
              {' '}
            </div>
            <div className="flex">
              <Dropdown
                title="Select Subject"
                value={selectedCourse}
                dataArray={courses}
                onChangeHandler={(value) => {
                  const obj: any = courses.filter((ele: { value: string; id: number }) => ele?.value === value)[0];
                  setSelectedCourseId(obj.id);
                  setSelectedCourse(obj.label);
                }}
                sxClass={{ border: '1px solid gray', width: '100%' }}
                parentStyle="grow p-4 w-1/2"
              />

              <Dropdown
                title="Teacher"
                value={selectedTeacher}
                dataArray={teachers}
                onChangeHandler={(value) => {
                  const obj: any = teachers.filter((ele: { label: any }) => ele.label === value)[0];
                  setSelectedTeacherId(obj.id);
                  setSelectedTeacher(value);
                }}
                sxClass={{ width: '100%', border: '1px solid gray' }}
                parentStyle="grow p-4 w-1/2"
              />
            </div>

            <div className="flex justify-evenly">
              <div className="pr-2">
                <CustomeTimePicker parentLabelClass="text-[0.75rem]" customLabel="Time From" onChange={(newValue: any) => { setSelectedTimeFrom(newValue); setSelectedTimeTo(null); }} value={selectedTimeFrom} minTime={dayjs().set('hour', 6).set('minute', 0)} />
              </div>

              <div>
                <CustomeTimePicker parentLabelClass="text-[0.75rem]" customLabel="Time To" onChange={(newValue: any) => { setSelectedTimeTo(newValue); }} value={selectedTimeTo} minTime={selectedTimeFrom !== null ? dayjs(selectedTimeFrom) : dayjs().set('hour', 6).set('minute', 0)} maxTime={dayjs().set('hour', 18).set('minute', 0)} />
              </div>
            </div>
            <div className="relative top-16">
              {showCourseError ? <div className="text-red-500 text-sm ml-4"> Please Select Course </div> : null}
              {showTeacherError ? <div className="text-red-500 text-sm ml-4"> Please Select Teacher </div> : null}
              {showFromError ? <div className="text-red-500 text-sm ml-4"> Please Select Time From </div> : null}
              {showToError ? <div className="text-red-500 text-sm ml-4"> Please Select Time To </div> : null}
            </div>
          </div>
          <div className="flex justify-end py-6 relative top-4">
            <Button onClick={() => (updateHolidayPopup ? handleUpdateDialogClick() : handleOkDialogClick())}>
              {' '}
              {updateHolidayPopup ? 'Update' : 'Ok'}
              {' '}
            </Button>
          </div>
        </CustomizedDialogs>

        <CustomizedDialogs
          open={actionConfirmPopup}
          maxwidth="sm"
          setOpen={(parameter: any) => { setActionConfirmPopup(false); }}
          title="Select Action"
        >
          <div>
            What actions you like to take ?
          </div>
          <div className="flex justify-end items-center mt-12">
            <Button
              onClick={() => {
                setActionConfirmPopup(false);
                handleSelectEvent(eventObj);
              }}
              sx={{ marginRight: '10px' }}
            >
              Update
            </Button>

            <Button
              onClick={() => {
                setConfirmDelete(true);
                setActionConfirmPopup(false);
              }}
              sx={{ backgroundColor: 'red', '&:hover': { backgroundColor: '#dd6666' } }}
            >
              Delete
            </Button>
          </div>
        </CustomizedDialogs>

        <DelteConfirmationPopup
          ConfirmDelete={ConfirmDelete}
          setConfirmDelete={setConfirmDelete}
          onClickYes={() => { deleteDebounceTimeBlock(); }}
        />

        <CustomizedDialogs
          open={markAsHolidayPopup}
          className="mycustomedialog"
          maxWidth="493px"
          fullWidth={false}
          title="Mark as Holiday"
          setOpen={() => { setMarkAsHolidayPopup(false); setHolidayCheck(false); setResonForHoliday(''); setUpdateHolidayPopup(false); setHolidayError(false); }}
        >
          <div>
            <div className="text-center mb-5">
              {updateHolidayPopup ? 'Update' : ''}
              {' '}
              Reason For Holiday
            </div>
            <CustomInput size="small" icon={true} error={false} fullWidth={true} value={resonForHoliday} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setResonForHoliday(e.target.value); setHolidayError(false); }} />
            {HolidayError === true ? <div className="text-red-500 text-sm"> Please Enter Reason </div> : null}
            <div className="flex justify-end py-6">
              <Button onClick={() => updateHolidateMsg()}>
                {' '}
                {updateHolidayPopup ? 'Update' : 'Add'}
                {' '}
              </Button>
            </div>

          </div>
        </CustomizedDialogs>

        <CustomizedDialogs
          open={desiderPopup}
          setOpen={(parameter: any) => { SetDesiderPopup(false); }}
          title=""
          className="mycustomedialog"
          maxWidth="493px"
          fullWidth={false}
        >
          <div className="flex flex-col">
            <div className="text-center font-bold mb-6 flex justify-between items-end">
              <div>
                <DatePicker
                  value={timeStart}
                  label="Select Date"
                  handlePickerChange={(val: any) => { setTimeStart(moment(val).toDate()); }}
                  sxType={3}
                  format="DD-MM-YYYY"
                  disablePast={false}
                />
              </div>
              <div>
                {moment(timeStart).format('Do MMMM YYYY, dddd')}
              </div>
            </div>

            <div className="flex mb-4 justify-between">
              <div>
                <Checkbox checked={isHolidayCheck} size="small" onChange={(e) => { setHolidayCheck(e.target.checked); setMarkAsHolidayPopup(true); SetDesiderPopup(false); }} />
                <span> Mark as Holiday </span>
              </div>

              <div>
                <Checkbox checked={isSchollTimetableCheck} size="small" onChange={(e) => { setSchollTimetableCheck(e.target.checked); SetSchoolTimetablePopup(true); SetDesiderPopup(false); }} />
                <span> Add School Timetable </span>
              </div>
            </div>
          </div>
        </CustomizedDialogs>

        <div className="flex flex-col mb-3 items-center justify-between overflow-auto gap-4">
          <div className="flex items-end gap-4">
            <Dropdown
              displayEmpty={false}
              title="Select School"
              value={selectedSchool || 'Select'}
              dataArray={SchoolArray}
              onChangeHandler={(val) => {
                const obj: any = SchoolArray.filter((ele: { label: any }) => ele.label === val)[0];
                setSchoolId(obj.id);
                setSelectedSchool(val);
                setSelectedSchoolBranchCount(obj.branch_count);
                setBranchArray([]);
                setClassesArray([]);
                setselectedBranch('');
                setBranchId(-1);
                setSelectedClass('');
                setClassId(-1);
              }}
              sxClass={{ width: '206px' }}
            />
            <Dropdown
              disabled={selectedSchoolBranchCount === 0}
              displayEmpty={false}
              title="Select Branch"
              value={selectedBranch || 'Select'}
              dataArray={BranchArray}
              onChangeHandler={(val) => {
                const obj: any = BranchArray.filter((ele: { label: any }) => ele.label === val)[0];
                setBranchId(obj.id);
                setselectedBranch(val);
                setSelectedClass('');
                setClassId(-1);
              }}
              sxClass={{ width: '206px' }}
            />
            <Dropdown
              displayEmpty={false}
              title="Select a class"
              value={selectedClass || 'Select'}
              dataArray={ClassesArray}
              onChangeHandler={(val) => {
                const obj: any = ClassesArray.filter((ele: { label: any }) => ele.label === val)[0];
                setClassId(obj.id);
                setSelectedClass(val);
              }}
              sxClass={{ width: '206px' }}
            />
            {selectedClass ? <Button className="w-[150px]" onClick={() => SetDesiderPopup(true)}>Add Timetable</Button> : null}
            {selectedClass ? (
              <div>
                <FileSelect onChange={onChange}>
                  {' '}
                  <Button loading={fileUploadLoading}> Bulk Upload </Button>
                  {' '}
                </FileSelect>
              </div>
            ) : null}
          </div>
          {selectedClass && (
            <CustomeDateRange
              parentClass="forEventCalendar"
              fromValProps={(fromVal) => { setStartDate(fromVal); }}
              toValProps={(toVal) => { setEndDate(toVal); }}
              fromInitialDate={today}
              toInitialDate={plus7}
              onSearchButtonClick={() => { setDateApplied(true); refetchTimetable(); setNaviagationDate(new Date(startDate)); }}
              resetDateRange={() => { setDateApplied(false); }}
            />
          )}
        </div>

        {selectedClass && selectedClass !== 'Select'
          ? (
            <div className="bg-white" ref={componentRef}>
              <DnDCalendar
                views={['week']}
                selectable={true}
                localizer={localizer}
                date={navigationDate}
                onNavigate={(navDate: Date) => { setNaviagationDate(navDate); }}
                min={new Date(2023, 0, 1, startTime, 0)}
                max={new Date(2023, 0, 1, 18, 0)}
                defaultView="week"
                enableAutoScroll={true}
                events={eventsData}
                style={{ width: '100%', height: '100vh' }}
                onSelectEvent={(event: any) => {
                  setEventObj(event);
                  setActionConfirmPopup(true);
                }}
                onSelectSlot={handleSelect}
                formats={{
                  dayFormat: (date, culture: any) => localizer.format(date, 'ddd D', culture),
                  dayRangeHeaderFormat: (date: any, culture: any) => moment(date.start).format('MMM YYYY'),
                  eventTimeRangeFormat: () => ''
                }}
                eventPropGetter={(event: any) => {
                  const backgroundColor = event.hexColor;
                  return { style: { backgroundColor } };
                }}
                className="studentSchedular"
                dayLayoutAlgorithm="overlap"
                onEventDrop={onEventDrop}
                onEventResize={() => { }}
                resizable={false}
              />
            </div>
          )
          : <div className="flex justify-center items-center bg-white h-[40vh] font-bold"> Please Select a Class </div>}

      </RouteLayout>
    </div>
  );
}
