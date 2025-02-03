/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-confusing-arrow */
/* eslint-disable arrow-parens */
/* eslint-disable linebreak-style */
import Button from '@component/button/button';
import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import Wrapper from '@shared/wrapper/Wrapper';
import { usePost } from '@shared/api/useApi';
import toast from '@shared/toast';
import { useNavigate, useParams } from 'react-router-dom';

interface Student {
  id: number;
  attendance: 'present' | 'absent' | null; // null means no attendance marked yet
  StudentLastName: string;
  StudentFirstName: string;
  Class: string;
}

// const studentsList: Student[] = [
//   { id: 1, name: 'John Doe', attendance: null },
//   { id: 2, name: 'Jane Smith', attendance: null },
//   { id: 3, name: 'Michael Johnson', attendance: null },
//   // Add more students as needed
// ];

const AttendanceUrl = import.meta.env.VITE_APP_ATTENDANCE_SERVICE_URL;

const AttendanceTable = ({
  tableData,
  MarkAttendanceEndpointUrl,
  selectedDate,
}: any) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [withredirection, setWithredirection] = useState(false);

  const navigate = useNavigate();
  const { schoolName } = useParams();

  useEffect(() => {
    console.log({withredirection});
  }
  ,[withredirection])
  // Handle attendance changes for each student
  const handleAttendanceChange = (id: number, status: 'present' | 'absent') => {
    setStudents((prevState) =>
      prevState.map((student) =>
        student.id === id ? { ...student, attendance: status } : student
      )
    );
  };

  // Submit attendance data
  const submitFunc = () => {
    
    if (!selectedDate) {
      toast('error', 'Please select a date before submitting attendance.');
      return;
    }

    const attendanceData = students.map((student) => ({
      student_id: student.id,
      first_name: student.StudentFirstName,
      last_name: student.StudentLastName,
      class_name: student.Class,
      status: student.attendance,
    }));

    const payload = {
      students: attendanceData,
    };

    mutate(payload);
  };

  const handleSubmit = () => {
    submitFunc();
    setWithredirection(false);
  };

  const submitAndExitHandler = () => {
    setWithredirection(true);
    submitFunc();
  };

  // Mark all students as present
  const markAllPresent = () => {
    setStudents((prevState) =>
      prevState.map((student) => ({ ...student, attendance: 'present' }))
    );
  };

  // Mark all students as absent
  const markAllAbsent = () => {
    setStudents((prevState) =>
      prevState.map((student) => ({ ...student, attendance: 'absent' }))
    );
  };

  useEffect(() => {
    const bb = tableData?.map((itm: any, index: number) => ({
      id: itm?.id,
      StudentLastName: itm?.StudentLastName,
      StudentFirstName: itm?.StudentFirstName,
      Class: itm?.Class,
      attendance: itm?.status,
    }));

    setStudents(bb || []);
  }, [tableData]);

  // Check if all students have their attendance marked
  const isAllAttendanceMarked = students.every(
    (student) => student.attendance !== null
  );

  const { isLoading: isLoading3, mutate } = usePost({
    baseURL: AttendanceUrl,
    url: MarkAttendanceEndpointUrl,
    onSuccess: () => {
      if (withredirection) {
        navigate(`/${schoolName}/attandance/reports`);
      }else{
        toast('success', 'Attendance Updated Successfully!');
      }
      
      // setBulk?Select([]);
      // setAbcentBulkSelect([]);

      
    },
    onError: (error: any) => {
      toast('error', error?.response?.data?.message);
    },
  });

  return (
    <div>
      <div className="my-4 flex gap-3 justify-end">
        <Button onClick={markAllPresent}>Mark All Present</Button>

        <Button onClick={markAllAbsent} variant="outlined">
          Mark All Absent
        </Button>
      </div>

      <div className="bg-white">
        <Wrapper>
          <TableContainer className="relative">
            <Table stickyHeader={true} aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell>Student First Name</TableCell>
                  <TableCell>Student Last Name</TableCell>
                  <TableCell>Class Name</TableCell>
                  <TableCell>Attendance</TableCell>
                </TableRow>
              </TableHead>
              <tbody>
                {students.map((student) => (
                  <TableRow key={student.id} className="text-center">
                    <TableCell>{student.StudentFirstName}</TableCell>
                    <TableCell>{student.StudentLastName}</TableCell>
                    <TableCell>{student.Class}</TableCell>
                    <TableCell>
                      <label className="mr-4">
                        <input
                          type="radio"
                          name={`attendance-${student.id}`}
                          value="present"
                          checked={student.attendance === 'present'}
                          onChange={() =>
                            handleAttendanceChange(student.id, 'present')
                          }
                          className="mr-2"
                        />
                        Present
                      </label>
                      <label>
                        <input
                          type="radio"
                          name={`attendance-${student.id}`}
                          value="absent"
                          checked={student.attendance === 'absent'}
                          onChange={() =>
                            handleAttendanceChange(student.id, 'absent')
                          }
                          className="mr-2"
                        />
                        Absent
                      </label>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        </Wrapper>
      </div>

      <div className="flex gap-3 justify-end">
        <div className="flex justify-end py-2">
          <Button
            disabled={!isAllAttendanceMarked} // Disable submit button if not all attendance is marked
            onClick={handleSubmit}
            // loading={isLoading3}
            tooltipMessage="Please submit status to the remaining students first"
          >
            Submit
          </Button>
        </div>

        <div className="flex justify-end py-2">
          <Button
            disabled={!isAllAttendanceMarked} // Disable submit button if not all attendance is marked
            onClick={submitAndExitHandler}
            tooltipMessage="Please submit status to the remaining students first"
          >
            Submit and exit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTable;
