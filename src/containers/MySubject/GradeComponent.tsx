/* eslint-disable comma-dangle */
/* eslint-disable implicit-arrow-linebreak */
import RouteLayout from '@layout/routeLayout';
import PageTitle from '@shared/pageTitle';
import Tabs from '@component/tab/Tabs';
import { useGet } from '@shared/api/useApi';
import { useSelector } from 'react-redux';
import { selectUser } from '@shared/store/userSlice';
import { useMemo, useEffect, useState } from 'react';
import GradeCard from '@containers/MySubject/GradeCard';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

function GradeComponent() {
  const [gradesDetails, setGradesDetails] = useState<any>([]);
  const navigate = useNavigate();
  const { userId: userID } = useSelector(selectUser);

  const { name = '', grade = '' } = useParams();
  const [matchIndex, setIndex] = useState(0);

  const { isLoading: gradesLoading, refetch: gradesFetch } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/grade-list/?keyword=${name}&user_id=${userID}`,
    onSuccess: (res: any) => {
      const respData = res?.data?.response;
      if (respData?.length) {
        setGradesDetails(respData);
      }
    },
    onError: () => {},
    enabled: false,
  });

  useEffect(() => {
    if (name) {
      gradesFetch();
    }
  }, [name]);

  const tabList = useMemo(
    () =>
      gradesDetails?.map((item: any) => ({
        title: item.grade,
        component: (
          <GradeCard
            shortName={name}
            gradeName={item.grade}
            courseID={item.courses_id}
            image={item?.icon_file}
            logo={item?.icon_link}
          />
        ),
      })),
    [gradesDetails]
  );

  useEffect(() => {
    const matchingIndex = tabList
      .map((ele: any) => ele.title)
      .indexOf(decodeURIComponent(grade));
    setIndex(matchingIndex === -1 ? 0 : matchingIndex);
  }, [tabList]);

  return (
    <RouteLayout>
      <div className="h-max w-full flex items-center py-4">
        <PageTitle title={name} />
      </div>
      {tabList?.length > 0 && (
        <Tabs
          currentTab={matchIndex}
          tabs={tabList}
          transparent={!true}
          border={true}
        />
      )}
    </RouteLayout>
  );
}
export default GradeComponent;
