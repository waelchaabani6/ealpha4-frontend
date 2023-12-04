import 'react-multi-carousel/lib/styles.css';
import RouteLayout from '@layout/routeLayout';
import React, { useEffect } from 'react';
import Carousel from 'react-multi-carousel';
import ImageOne from '@images/staticPageImages/slider_1.jpg';
import ImageTwo from '@images/staticPageImages/slider_2.jpg';
import AboutImage from '@images/staticPageImages/about_eAlpha.jpg';
import AdminImage from '@images/staticPageImages/admin.jpg';
import TeacherImage from '@images/staticPageImages/teacher.jpg';
import StudentImage from '@images/staticPageImages/student.jpg';
import SubjectImage1 from '@images/staticPageImages/books/1.png';
import SubjectImage2 from '@images/staticPageImages/books/2.png';
import SubjectImage3 from '@images/staticPageImages/books/3.png';
import SubjectImage4 from '@images/staticPageImages/books/4.png';
import SubjectImage5 from '@images/staticPageImages/books/5.png';
import SubjectImage6 from '@images/staticPageImages/books/6.png';
import SubjectImage7 from '@images/staticPageImages/books/7.png';
import SubjectImage8 from '@images/staticPageImages/books/8.png';
import SubjectImage9 from '@images/staticPageImages/books/9.png';
import SubjectImage10 from '@images/staticPageImages/books/10.png';
import SubjectImage11 from '@images/staticPageImages/books/11.png';
import SubjectImage12 from '@images/staticPageImages/books/12.png';
import ExamViewBanner from '@images/staticPageImages/examview-banner.jpg';
import Button from '@component/button/button';
import { forceLogout, selectUser } from '@shared/store/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { USER_TYPE } from '@constants/constants';
import { Navigate } from 'react-router-dom';
import StaticFooter from './staticFooter';
import StaticHeader from './staticHeader';

const imgList = [
  SubjectImage1,
  SubjectImage2,
  SubjectImage3,
  SubjectImage4,
  SubjectImage5,
  SubjectImage6,
  SubjectImage7,
  SubjectImage8,
  SubjectImage9,
  SubjectImage10,
  SubjectImage11,
  SubjectImage12
];

function getResponsiveObj(items: number[]) {
  return (
    {
      superLargeDesktop: {
        // the naming can be any, depends on you.
        breakpoint: { max: 4000, min: 3000 },
        items: items[0]
      },
      desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: items[1]
      },
      tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: items[2]
      },
      mobile: {
        breakpoint: { max: 464, min: 0 },
        items: items[3]
      }
    }
  );
}

export default function StaticHome() {
  const { forceLogout: fLgout, userId, role, school_name: schoolName, branch_name: branchName } = useSelector(selectUser);
  const dispatch = useDispatch();
  useEffect(() => {
    if (fLgout) {
      dispatch(forceLogout(false));
    }
  }, [fLgout]);
  if (fLgout) {
    return <Navigate to="/auth" replace={true} />;
  }
  if (userId) {
    const navLink = role?.name === USER_TYPE.SUPER_ADMIN ? '/dashboard' : `/${branchName || schoolName}/dashboard`;
    return <Navigate to={navLink} replace={true} />;
  }
  return (
    <RouteLayout navBack={false}>
      <StaticHeader />
      <div className="mt-24">
        <Carousel
          arrows={false}
          showDots={true}
          responsive={getResponsiveObj([1, 1, 1, 1])}
          infinite={true}
        >
          <div className="h-full w-full relative">
            <img loading="lazy" src={ImageOne} alt="" />
          </div>
          <div className="h-full w-full relative">
            <img loading="lazy" src={ImageTwo} alt="" />
            <button type="button" className="h-[20px] text-[10px] md:text-base md:h-[40px] bg-sunlight absolute top-[67%] right-[56%] px-2 md:px-6 font-semibold text-white">Learn More</button>
          </div>
        </Carousel>
        <div className="grid grid-col-1  gap-y-4 md:grid-cols-2 md:gap-x-4 p-10">
          <div className="px-8">
            <h2 className="text-2xl font-bold mb-4">About eAlpha</h2>
            <p className="text-sm">
              <strong> eAlpha </strong>
              is your dynamic Learning Management System, allowing you to work both online and offline with interactive content on any device.
              Available on any operating system, eAlpha enables your lessons and assignments to be created, completed, tracked, and reported on – in or out of the classroom, on the move, or wherever else you might be. eAlpha will record all your changes in the LMS (Learning Management System) in real time, or if working offline as soon as the internet connection is restored.
            </p>
            <Button sx={{ backgroundColor: 'var(--sunlight)', marginTop: '12px' }}>LEARN MORE</Button>
          </div>
          <div className="flex pl-8 md:pl-0">
            <img src={AboutImage} alt="" className="h-64 self-start" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2 bg-accent flex items-center pl-10 md:pl-20">
            <div className="my-2">
              <h2 className="text-2xl font-bold justify-self-start">Administrator View :</h2>
              <ul className="list-disc mt-6 text-sm space-y-2">
                <li>Include school branding by inserting their school logo as an icon.</li>
                <li>Expertly manage user access – both students and teachers.</li>
                <li>Instantly generate multi-level progress reports (school wide, grade level, class, teacher and student).</li>
                <li>Quickly assign authorization for teachers and students to course content.</li>
              </ul>
              {/* <Button sx={{ backgroundColor: 'var(--sunlight)', marginTop: '12px' }}>LEARN MORE</Button> */}
            </div>
          </div>
          <div className="flex-1">
            <img loading="lazy" src={AdminImage} alt="" className="h-full w-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="flex-1">
            <img loading="lazy" src={TeacherImage} alt="" className="h-full w-full" />
          </div>
          <div className="md:col-span-2 bg-sunlight flex items-center pl-10 md:pl-20 text-white">
            <div className="my-2">
              <h2 className="text-2xl font-bold justify-self-start">Teacher View includes :</h2>
              <ul className="list-disc mt-6 text-sm space-y-2">
                <li>Access all teacher guides, student books, practice and work books, ancillaries and assessments complete with full interactivity.</li>
                <li>Navigate with ease through hyperlinked content pages.</li>
                <li>Set assignments easily to whole classes or groups or individual students.</li>
                <li>Effortlessly monitor and report student progress.</li>
              </ul>
              <Button sx={{ backgroundColor: 'white', color: 'black', marginTop: '12px' }}>LEARN MORE</Button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2 bg-accent flex items-center pl-10 md:pl-20">
            <div className="my-2">
              <h2 className="text-2xl font-bold justify-self-start">Student View includes :</h2>
              <ul className="list-disc mt-6 text-sm space-y-2">
                <li>Access to student books, practice and work books, ancillaries and assessments.</li>
                <li>Fully interactive and engaging exercises.</li>
                <li>Instant checking and scoring functionality.</li>
                <li>Catering for a variety of learning styles.</li>
                <li>Easy and fun to use.</li>
              </ul>
              <Button sx={{ backgroundColor: 'var(--sunlight)', marginTop: '12px' }}>LEARN MORE</Button>
            </div>
          </div>
          <div className="flex-1">
            <img src={StudentImage} alt="" loading="lazy" className="h-full w-full" />
          </div>
        </div>
        <div className="my-4">
          <p className="text-center font-bold text-2xl">Alpha Products</p>
          <Carousel
            arrows={false}
            showDots={true}
            pauseOnHover={true}
            slidesToSlide={5}
            responsive={getResponsiveObj([5, 5, 5, 3])}
            infinite={true}
          >
            {
              imgList.map((img: any) => (
                <div className="p-5" key={img}>
                  <img src={img} alt="" loading="lazy" />
                </div>
              ))
            }
          </Carousel>
        </div>
        <div className="relative">
          <img loading="lazy" src={ExamViewBanner} alt="" />
          <button type="button" className="h-[20px] text-[10px] md:text-base md:h-[40px] bg-sunlight absolute top-[72%] left-[35%] px-2 md:px-6 font-semibold text-white">Learn More</button>
        </div>
      </div>
      <StaticFooter />
    </RouteLayout>
  );
}
