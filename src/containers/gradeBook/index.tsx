import React, { useEffect, useRef, useState } from 'react';
import Dropdown from '@component/dropdown/Dropdown';
import Button from '@component/button/button';
import PrintIcon from '@mui/icons-material/Print';
import EmailIcon from '@mui/icons-material/Email';
import { useGet, usePatch, api, usePost } from '@shared/api/useApi';
import toast from '@shared/toast';
import CustomCheckbox from '@component/checkbox/CustomCheckbox';
import Input from '@component/input';
import AddIcon from '@mui/icons-material/Add';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { USER_TYPE } from '@constants/constants';
import Loader from '@shared/loader';
import { CSVLink } from 'react-csv';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import { ReactComponent as Cross } from '@images/cross.svg';
import { useSelector } from 'react-redux';
import { selectUser } from '@shared/store/userSlice';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress } from '@mui/material';
import ReactToPrint from 'react-to-print';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { sortData } from '@utility/utility';
import RouteLayout from '../layout/routeLayout';
import { TABLE_LABELS, TOOLBAR_LABELS } from '../../constants/constants';
import Wrapper from '../../shared/wrapper/Wrapper';

const userServiceUrl = import.meta.env.VITE_APP_USER_SERVICE_URL;
const schoolServiceUrl = import.meta.env.VITE_APP_SCHOOL_SERVICE_URL;
const assessmentServiceUrl = import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL;

interface Row {
  [key: string]: any;
}

interface Column {
  [key: string]: any;
}

interface TableData {
  columns: Column[];
  rows: Row[];
}

const printButton = () => <PrintIcon />;

export default function Index() {
  const { schoolId, role, user_profile_id: teacherID, branchId } = useSelector(selectUser);
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const [headerColumns, setHeaderColumns] = useState<any>([]);
  const [removedIdColumns, setRemovedIdColumns] = useState<any>([]);
  const [tableData, setTableData] = useState<TableData>({
    columns: [...headerColumns],
    rows: []
  });

  const headers = tableData.columns?.map((obj) => obj.label);
  const rowData = [...tableData.rows];
  const csvData: any = rowData?.map((obj: any, i: any) => {
    const data = { ...obj };
    delete data?.grade_tests;
    data.id = i + 1;
    const array = Object.values(data);
    const third = array.splice(3, 1)[0];
    const fourth = array.splice(3, 1)[0];
    array.push(third, fourth);
    return array;
  });

  // Toolbar Email
  const { isLoading: emailSendLoading, mutate: mutateEmail, isLoading: emailLoad } = usePost({
    baseURL: userServiceUrl,
    url: `users-service/grade-book-list/pdf-download/`,
    onSuccess: (response: any) => {
      toast('success', 'Email sent successfully');
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    }
  });

  const ADMIN_TOOLBAR_MENU = [
    {
      title: 'Add',
      icon: tableData.rows.length > 0 ? <AddIcon /> : <AddIcon color="disabled" />
    },
    {
      title: 'Email',
      icon: tableData.rows.length > 0 ? (emailSendLoading || emailLoad) ? <Loader size={20} /> : <EmailIcon /> : <EmailIcon color="disabled" />
    },
    {
      title: TOOLBAR_LABELS.EXPORT,
      icon: (
        <CSVLink
          filename="Grade Book List.csv"
          data={csvData}
          headers={headers}
          enclosingCharacter=""
        >
          <Share />
        </CSVLink>
      )
    },
    {
      title: 'Print',
      icon: <ReactToPrint
        trigger={printButton}
        content={() => componentRef.current}
      />
    }
  ];

  const [allClasses, setAllClasses] = useState<any>();
  const [selectedClass, setSelectedClass] = useState<any>('');
  const [allTeacherClasses, setAllTeacherClasses] = useState<any>();
  const [selectedTeacherClass, setSelectedTeacherClass] = useState<any>('');
  const [weightingFinalTotal, setWeightingFinalTotal] = useState<number>(0);
  const [averageFinalTotal, setAverageFinalTotal] = useState<number>(0);
  const [updateData, setUpdateData] = useState<any>(false);
  const componentRef = useRef(null);

  const handelSendEmail = () => {
    const payload = {
      class_id: role.name === USER_TYPE.TEACHER ? selectedTeacherClass : selectedClass
    };
    mutateEmail(payload);
  };

  useEffect(() => {
    if (role.name === USER_TYPE.TEACHER && teacherID) {
      const obj = { teacher_id: teacherID };
      mutateTeacherClasses(obj);
    } else if (role.name === USER_TYPE.SCHOOL_ADMIN || role.name === USER_TYPE.BRANCH_ADMIN) {
      classesFetch();
    }
  }, [role]);
  const Select = {
    label: 'Select',
    value: 'All'
  };
  const { isLoading: loadingTeacher, mutate: mutateTeacherClasses } = usePost({
    baseURL: schoolServiceUrl,
    url: `schools-service/school-classes/teacher/assigned-class`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response;
      const body: any = [];
      resp?.map((i: any) => {
        body.push(
          {
            label: i?.name,
            value: i?.class_id
          }
        );
        body.sort(sortData);
        return true;
      });
      setAllTeacherClasses([Select, ...body]);
    },
    onError: ({ response }: any) => {},
    enabled: false
  });

  useEffect(() => {
    if (allTeacherClasses) {
      setSelectedTeacherClass(allTeacherClasses[0]?.value);
    }
  }, [allTeacherClasses]);

  const saveGradeBookData = () => {
    const className = role.name === USER_TYPE.TEACHER
      ? allTeacherClasses.find((item: any) => item.value === selectedTeacherClass)
      : allClasses.find((item: any) => item.value === selectedClass);
    const saveFlag = headerColumns.every((obj: any) => 'subjectFlag' in obj);
    if (updateData || removedIdColumns.length > 0) {
      const payloadEdit = {
        class_id: role.name === USER_TYPE.TEACHER ? selectedTeacherClass : selectedClass,
        class_name: className.label,
        school_id: schoolId,
        branch_id: branchId,
        is_delete: removedIdColumns,
        tests: [],
        students: []
      };
      const newHeaderData = headerColumns.filter((newEle: any) => newEle.subjectFlag);
      const headerData: any = newHeaderData?.map((items: any) => ({ id: items.id, title: items?.label, points_weighting: items?.points_weighting }));
      const studentData: any = tableData.rows.map((item) => (
        {
          id: item?.id,
          first_name: item?.first_name,
          last_name: item?.last_name,
          test: newHeaderData?.map((subj: any) => {
            const subId = item?.grade_tests.find((i: any) => i.grade_test__title === subj.mapper);
            return {
              id: subId?.id,
              title: subj?.label,
              score: item[subj?.mapper] || 0
            };
          })
        }
      ));
      payloadEdit.tests = headerData;
      payloadEdit.students = studentData;
      mutateGradeBookEdit(payloadEdit);
    }
    if (!saveFlag) {
      const payloadSave = {
        class_id: role.name === USER_TYPE.TEACHER ? selectedTeacherClass : selectedClass,
        class_name: className.label,
        school_id: schoolId,
        branch_id: branchId,
        tests: [],
        students: []
      };
      const newHeaderData = headerColumns.filter((newEle: any) => !newEle.subjectFlag);
      const headerData = newHeaderData?.map((items: any) => ({ title: items?.label, points_weighting: items?.points_weighting || 0 }));
      const studentData: any = tableData.rows.map((item) => ({
        id: item.id,
        first_name: item.first_name,
        last_name: item.last_name,
        test: newHeaderData.map((subj: any) => ({
          title: subj.label,
          score: item[subj.mapper] || 0
        }))
      }));
      payloadSave.tests = headerData;
      payloadSave.students = studentData;
      mutateGradeBookSave(payloadSave);
    }
  };

  //  Get Classes
  const { isLoading: classesLoading, refetch: classesFetch } = useGet({
    baseURL: schoolServiceUrl,
    url: `schools-service/school-classes/?limit=1000&school_id=${schoolId}${branchData?.name ? `&branch_name=${branchData?.name}` : ''}`,
    cacheTime: 2000,
    onSuccess: (res: any) => {
      const resp = res?.data?.response?.results;
      const body: any = [];
      resp?.map((i: any) => {
        body.push(
          {
            label: i?.name,
            value: i?.id
          }
        );
        body.sort(sortData);
        return true;
      });
      setAllClasses([Select, ...body]);
    },
    onError: () => { },
    enabled: false
  });

  useEffect(() => {
    if (allClasses) {
      setSelectedClass(allClasses[0]?.value);
    }
  }, [allClasses]);

  // Post API===============================================================================================

  const { isLoading: loadingSave, mutate: mutateGradeBookSave } = usePost({
    baseURL: assessmentServiceUrl,
    url: `assessments-service/grade-book-create/`,
    onSuccess: (response: any) => {
      setRemovedIdColumns([]);
      setUpdateData(false);
      refetch();
      toast('success', 'Data Created successfully');
    },
    onError: ({ response }: any) => {
      setRemovedIdColumns([]);
      setUpdateData(false);
      refetch();
      toast('error', response?.data?.message || 'Error');
    }
  });

  const { isLoading: loadingEdit, mutate: mutateGradeBookEdit } = usePatch({
    baseURL: assessmentServiceUrl,
    url: `assessments-service/grade-book-edit/`,
    onSuccess: (response: any) => {
      setRemovedIdColumns([]);
      setUpdateData(false);
      refetch();
      toast('success', 'Data Updated successfully');
    },
    onError: ({ response }: any) => {
      setRemovedIdColumns([]);
      setUpdateData(false);
      refetch();
      toast('error', response?.data?.message || 'Error');
    }
  });

  const { isLoading, refetch } = useGet({
    baseURL: assessmentServiceUrl,
    url: `assessments-service/grade-book-list/?&limit=1000${schoolId ? `&school_id=${schoolId}` : ''}${selectedClass ? `&class_id=${selectedClass}` : ''}
    ${selectedTeacherClass ? `&class_id=${selectedTeacherClass}` : ''}${branchId ? `&branch_id=${branchId}` : ''}`,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response;
      if (Object.keys(respData).length) {
        const newtableData = respData?.students?.map((item: any): any => {
          let temp = { ...item };
          if (temp?.grade_tests?.length) {
            const subjectContents = temp?.grade_tests.reduce((acc: any, element: any) => ({ ...acc, [element?.grade_test__title]: element?.score }),
              {});
            temp = { ...temp, ...subjectContents };
          }
          return temp;
        });
        const headerContents = respData?.tests.reduce((acc: any, element: any) => ([...acc,
          {
            id: element?.id,
            label: element?.title,
            isSort: true,
            mapper: element?.title,
            component: 'checkbox',
            checked: true,
            points_weighting: element?.points_weighting,
            subjectFlag: true
          }]),
        []);
        const tableColumns = [
          {
            label: TABLE_LABELS?.SR_NO,
            align: 'center'
          },
          {
            label: 'Student First Name',
            mapper: 'first_name',
            isSort: true
          },
          {
            label: 'Student Last Name',
            isSort: true,
            mapper: 'last_name'
          },
          ...headerContents,
          {
            label: 'Final Total Score',
            isSort: true,
            mapper: 'final_score'
          },
          {
            label: 'Final Average Score',
            isSort: true,
            mapper: 'average'
          }
        ];
        setHeaderColumns(headerContents);
        setTableData({ columns: tableColumns, rows: newtableData });
      } else {
        setTableData({ columns: [], rows: [] });
      }
    },
    onError: ({ response }: any) => {
    },
    enabled: false
  });

  const headerChangeHandler = (event: React.ChangeEvent<HTMLInputElement>, selector: any) => {
    setTableData((prevState) => {
      const index = prevState.columns.findIndex((obj: any) => obj.mapper === selector);
      if (prevState.columns[index]?.subjectFlag) {
        setUpdateData(true);
      }
      const newColumns = [...prevState.columns];
      newColumns[index].label = event.target.value;
      return {
        columns: newColumns,
        rows: tableData.rows
      };
    });
  };

  const rowDataChangeHandler = (event: React.ChangeEvent<HTMLInputElement>, selector: any, index: number) => {
    const ind = tableData.columns.findIndex((obj: any) => obj.mapper === selector);
    if (tableData.columns[ind]?.points_weighting >= event.target.value) {
      setTableData((prevState) => {
        const headerIndex = prevState.columns.findIndex((obj: any) => obj.mapper === selector);
        if (prevState.columns[headerIndex]?.subjectFlag) {
          setUpdateData(true);
        }
        const newRows = prevState.rows.map((row, i) => {
          const newRow: any = { ...row };
          const newColumns = [...prevState.columns];
          const count = newColumns.filter((obj) => obj.checked === true).length;
          const finalScore = newRow.final_score ? parseFloat(newRow.final_score) : 0;
          const studentscore = newRow[selector] ? parseFloat(newRow[selector]) : 0;
          if (i === index) {
            const sum = finalScore - studentscore;
            let num: number = parseFloat(event.target.value);
            if (Number.isNaN(num)) {
              num = 0;
            }
            newRow[selector] = num;
            newRow.final_score = sum + num;
            newRow.average = (newRow.final_score / count).toFixed(2);
          }
          return newRow;
        });
        return {
          columns: prevState.columns,
          rows: newRows
        };
      });
    } else {
      toast('error', 'Score should not be greater then Points/Weighting');
    }
  };

  const pointsWeightingChangeHandler = (event: React.ChangeEvent<HTMLInputElement>, selector: any) => {
    setTableData((prevState) => {
      const index = prevState.columns.findIndex((obj: any) => obj.mapper === selector);
      if (prevState.columns[index]?.subjectFlag) {
        setUpdateData(true);
      }
      const newColumns = [...prevState.columns];
      let num: number = parseFloat(event.target.value);
      if (Number.isNaN(num)) {
        num = 0;
      }
      newColumns[index].points_weighting = num;
      const totalPoints = prevState.columns.reduce((acc, obj) => {
        if (obj.points_weighting) {
          return acc + obj.points_weighting;
        }
        return acc;
      }, 0);
      setWeightingFinalTotal(totalPoints);
      return {
        columns: newColumns,
        rows: prevState.rows
      };
    });
  };

  const removeColumn = (selector?: any, status?: any): any => {
    const subId = headerColumns?.find((i: any) => i.mapper === selector);
    if (subId?.id) {
      setRemovedIdColumns([...removedIdColumns, subId.id]);
    }
    const element = headerColumns.findIndex((obj: any) => obj.mapper === selector);
    const newArra = [...headerColumns];
    newArra.splice(element, 1);
    setHeaderColumns(newArra);
    setTableData((prevState) => {
      const index = prevState.columns.findIndex((obj: any) => obj.mapper === selector);
      const newColumns = [...prevState.columns];
      newColumns.splice(index, 1);
      const count = newColumns.filter((obj) => obj.checked === true).length;
      const newRows = prevState.rows.map((row) => {
        const newRow: any = { ...row };
        const studentscore = newRow[selector] ? parseFloat(newRow[selector]) : 0;
        if (status) {
          newRow.final_score -= studentscore;
          const avgSub = newRow.final_score / count;
          newRow.average = avgSub ? avgSub.toFixed(2) : 0;
        } else {
          newRow.final_score += studentscore;
          const avgAdd = newRow.final_score / count;
          newRow.average = avgAdd ? avgAdd.toFixed(2) : 0;
        }
        delete newRow[selector];
        return newRow;
      });
      return {
        columns: newColumns,
        rows: newRows
      };
    });
  };

  const addheaderOnTable = () => {
    const newObj = {
      label: '',
      isSort: true,
      mapper: `Subject${headerColumns.length + 1}`,
      component: 'checkbox',
      checked: true
    };
    setHeaderColumns([...headerColumns, newObj]);
    const arrlength = headerColumns.length + 3;
    setTableData((prevState) => {
      const newArray = [...prevState.columns.slice(0, arrlength), newObj, ...prevState.columns.slice(arrlength)];
      const newRows = prevState.rows.map((row) => {
        const newRow: any = { ...row };
        newRow[`Subject${headerColumns.length + 1}`] = null;
        return newRow;
      });
      return {
        columns: newArray,
        rows: newRows
      };
    });
  };

  const handleUncheck = (event: React.ChangeEvent<HTMLInputElement>, data: any, selector?: any): any => {
    setTableData((prevState) => {
      const index = prevState.columns.findIndex((obj: any) => obj.mapper === selector);
      const newColumns = [...prevState.columns];
      newColumns[index].checked = event;
      const count = newColumns.filter((obj) => obj.checked === true).length;
      const newRows = prevState.rows.map((row) => {
        const newRow: any = { ...row };
        const studentscore = newRow[selector] ? parseFloat(newRow[selector]) : 0;
        if (!event) {
          newRow.final_score -= studentscore;
          const avgSub = newRow.final_score / count;
          newRow.average = avgSub ? avgSub.toFixed(2) : 0;
        } else {
          newRow.final_score += studentscore;
          const avgAdd = newRow.final_score / count;
          newRow.average = avgAdd ? avgAdd.toFixed(2) : 0;
        }
        return newRow;
      });
      return {
        columns: newColumns,
        rows: newRows
      };
    });
  };

  const handleToolbarAction = async (title: string) => {
    if (title === TOOLBAR_LABELS.ADD && tableData.rows.length > 0) {
      addheaderOnTable();
    } else if (title === TOOLBAR_LABELS.EMAIL && tableData.rows.length > 0) {
      handelSendEmail();
    }
  };

  useEffect(() => {
    if (selectedClass || selectedTeacherClass) {
      refetch();
    }
  }, [selectedClass, selectedTeacherClass]);

  useEffect(() => {
    const totalPoints: number = tableData.columns.reduce((acc, obj) => {
      if (obj.points_weighting && obj.checked) {
        return acc + obj.points_weighting;
      }
      return acc;
    }, 0);
    const count = tableData.columns.filter((obj) => obj.checked === true).length;
    const average = totalPoints / count;
    setWeightingFinalTotal(totalPoints || 0);
    setAverageFinalTotal(average || 0);
  }, [tableData]);

  const exceptThisSymbols = ['e', 'E', '+', '-', '.'];

  return (
    <RouteLayout>
      <HeaderMenus title="Grade Book" menuArray={ADMIN_TOOLBAR_MENU} handleToolbarAction={handleToolbarAction} />
      <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
        <div className="flex md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
          <Dropdown
            title="Select Class"
            value={role.name === USER_TYPE.TEACHER ? selectedTeacherClass : selectedClass}
            dataArray={role.name === USER_TYPE.TEACHER ? allTeacherClasses : allClasses}
            loading={role.name === USER_TYPE.TEACHER ? loadingTeacher : classesLoading}
            onChangeHandler={role.name === USER_TYPE.TEACHER ? (e) => setSelectedTeacherClass(e) : (e) => setSelectedClass(e)}
          />
        </div>
      </div>
      {/* Table Section */}
      <div className="wrapperBorder mt-3" ref={componentRef}>
        <Wrapper>
          {
            (isLoading || loadingEdit || loadingSave) && <LinearProgress />
          }
          <TableContainer className="relative" sx={{ maxHeight: '100%' }}>
            <Table stickyHeader={true} aria-label="sticky table" className="w-100">
              <TableHead>
                <TableRow>
                  {
                    tableData?.columns?.map((item: any) => (
                      <TableCell>
                        {
                          (
                            item?.component
                              ? (
                                <div className="flex items-center">
                                  <Input type="text" size="small" value={item?.label} inputProps={{ maxLength: 200 }} onChange={(e: React.ChangeEvent<HTMLInputElement>) => headerChangeHandler(e, item?.mapper)} />
                                  <CustomCheckbox
                                    selector={item?.mapper}
                                    data={tableData}
                                    handleselect={handleUncheck}
                                    checked={item?.checked}
                                    size="small"
                                  />
                                  <span className="rounded-[4px] border border-[#D2D2D2] p-1 cursor-pointer" role="presentation" onClick={() => removeColumn(item?.mapper, item?.checked)}>
                                    <Cross />
                                  </span>
                                </div>
                              ) : item?.label
                          )
                        }
                      </TableCell>
                    ))
                  }
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow sx={{ 'th.MuiTableCell-root': { backgroundColor: 'var(--white)' } }}>
                  {
                    tableData?.columns?.map((item: any, inn: number) => (
                      <TableCell sx={inn === 1 || inn === 2 ? { backgroundColor: 'var(--light-accent) !important' } : {}}>
                        <div>
                          {inn === 1 ? 'Points/Weighting' : item?.component
                            ? <Input type="number" size="small" onKeyDown={(e) => exceptThisSymbols.includes(e.key) && e.preventDefault()} value={item?.points_weighting || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => pointsWeightingChangeHandler(e, item?.mapper)} />
                            : inn === headerColumns.length + 3 ? weightingFinalTotal.toFixed(2) : inn === headerColumns.length + 4 ? averageFinalTotal.toFixed(2) : '' }
                        </div>
                      </TableCell>
                    ))
                  }
                </TableRow>
                {
              tableData.rows.length
                ? (
                  tableData?.rows.map((row: any, index: number): JSX.Element => (
                    <TableRow key={`${row?.id}-${index}`} sx={{ '& > *': { borderBottom: 'unset' } }}>
                      {
                        tableData?.columns?.map((item: any, i: any) => (
                          <TableCell key={`${item?.mapper}-${i}`}>
                            {
                              (
                                item?.component
                                  ? (
                                    <div>
                                      <Input type="number" size="small" onKeyDown={(e) => exceptThisSymbols.includes(e.key) && e.preventDefault()} value={row[item?.mapper] || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => rowDataChangeHandler(e, item?.mapper, index)} />
                                    </div>
                                  ) : item?.mapper ? row[item?.mapper] : (index + 1).toString()
                              )
                            }
                          </TableCell>
                        ))
                      }
                    </TableRow>
                  )
                  )) : (
                    <TableRow>
                      <TableCell colSpan={13} align="center">
                        <p>No Student Assigned To This Class.</p>
                      </TableCell>
                    </TableRow>
                )
                }
              </TableBody>
            </Table>
            <div className="mt-4 float-right space-x-5 p-4">
              <Button type="submit" onClick={saveGradeBookData} loading={loadingEdit || loadingSave} disabled={!(updateData || removedIdColumns.length > 0) && headerColumns.every((obj: any) => 'subjectFlag' in obj)}>Save</Button>
            </div>
          </TableContainer>
        </Wrapper>
      </div>
    </RouteLayout>
  );
}
