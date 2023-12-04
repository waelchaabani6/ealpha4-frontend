import { ReactComponent as ICReport } from '@images/smicons/Ic_reports.svg';
import { ReactComponent as ICStudent } from '@images/smicons/ic_StudentBooks.svg';
import { ReactComponent as ICPractice } from '@images/smicons/ic_Practice.svg';
import { ReactComponent as ManageCourcePermission } from '@images/smicons/managecourceper.svg';
import { ReactComponent as ICCourses } from '@images/smicons/Ic_Courses.svg';
import { ReactComponent as ICAssessments } from '@images/smicons/ic_Assessments.svg';
import { ReactComponent as ICAssignments } from '@images/smicons/ic_Assignments.svg';
import { ReactComponent as ICAlphaSims } from '@images/smicons/ic_AlphaSims.svg';
import { ReactComponent as ICAlphaClips } from '@images/smicons/ic_AlphaClips.svg';
import { ReactComponent as TimeTable } from '@images/smicons/Ic_attendance.svg';
import { ReactComponent as AttenDance } from '@images/smicons/gradebook.svg';
import { Link } from 'react-router-dom';
import { selectUser } from '@shared/store/userSlice';
import { useSelector } from 'react-redux';

function TeacherIconContainer() {
  const { role: { name: role } } = useSelector(selectUser);
  const { schoolData } = useSelector((state: any) => state?.school);
  const schoolName = schoolData?.school_name || '';
  const cards = [
    {
      text: 'School Timetable',
      link: `/${schoolName}/time-table`,
      img: <TimeTable />
    },
    {
      text: 'Attendance',
      link: `/${schoolName}/attandance`,
      img: <AttenDance />
    },
    {
      text: 'My Courses',
      link: `/${schoolName}/MySubject`,
      img: <ICCourses />
    },
    {
      text: 'Alpha Clips',
      link: `/${schoolName}/coming-soon`,
      img: <ICAlphaClips />
    },
    {
      text: 'Alpha Sims',
      link: `/${schoolName}/coming-soon`,
      img: <ICAlphaSims />
    },
    {
      text: 'Online Resources',
      link: `/${schoolName}/coming-soon`,
      img: <ManageCourcePermission />
    },
    {
      text: 'Digital Library',
      link: `/${schoolName}/digital-library`,
      img: <ICPractice />
    },
    {
      text: 'Assignments',
      link: `/${schoolName}/assignment`,
      img: <ICAssignments />
    },
    {
      text: 'Assessments',
      link: `/${schoolName}/assessments`,
      img: <ICAssessments />
    },
    {
      text: 'Reports',
      link: `/${schoolName}/reports`,
      img: <ICReport />
    },
    {
      text: 'Grade Book',
      link: `/${schoolName}/grade-book`,
      img: <ICStudent />
    }
  ];

  const index = cards.findIndex((obj: any) => obj?.text === 'Grade Book');
  if (index !== -1 && role === 'Student') {
    cards.splice(index, 1);
  }

  return (
    <div className="sm-container">
      <div className="card-container">
        {
          cards.map((i: any) => (
            <Link key={i?.text} to={i?.link} className="cards">
              {i?.img}
              <span>{i?.text}</span>
            </Link>
          ))
        }
      </div>
    </div>
  );
}

export default TeacherIconContainer;
