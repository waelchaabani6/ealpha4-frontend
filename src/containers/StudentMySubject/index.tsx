/* eslint-disable operator-linebreak */
/* eslint-disable no-confusing-arrow */
/* eslint-disable implicit-arrow-linebreak */
import RouteLayout from "@layout/routeLayout";
import PageTitle from "@shared/pageTitle";
import DebounceInput from "@component/input/DebounceInput";
import Loader from "@shared/loader";
import { useGet, api } from "@shared/api/useApi";
import { useSelector } from "react-redux";
import { selectUser } from "@shared/store/userSlice";
import { useEffect, useState } from "react";
import SmallCard from "./StudentSmallCard";

function MySubject() {
  const [courseDetails, setCourseDetails] = useState<any>({});
  const { userId: userID } = useSelector(selectUser);
  const [searchString, setSearchString] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [categoriesData, setCategoriesData] = useState([]);

  //  Get Categories
  const {
    isLoading: categoriesLoading,
    data,
    isSuccess,
  } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/content/?selection=Category${searchString ? `&search=${searchString}` : ""}`,
    onSuccess: (res: any) => {
      const respData = res?.data?.response?.results;
      setCategoriesData(respData);
      setCourseDetails({});
    },
    onError: () => {},
  });

  const getAllcoursesDetails = (categoryArray: any) => {
    const resultAPIs = categoryArray?.map((items: any) =>
      api(import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL)
        .get(
          `course-code-service/courses/assigned_courses/${userID}/details/?Category=${items.content}`
        )
        .then((courses: any) => ({ category: items.content, courses }))
    );
    Promise.allSettled(resultAPIs)
      .then((res: any) => {
        if (res?.length) {
          const courseByCategoryDict: { [key: string]: [] } = {};
          res?.forEach((element: any) => {
            courseByCategoryDict[element?.value?.category] =
              element?.value?.courses?.data?.response;
          });
          setCourseDetails(courseByCategoryDict);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (data) {
      if (Object.keys(data?.data?.response).length) {
        getAllcoursesDetails(categoriesData);
      }
    }
  }, [categoriesData, data]);

  const conditionSatisfied = Object.keys(courseDetails).some(
    (category: any) => courseDetails[category].length > 0
  );

  return (
    <div>
      <RouteLayout navBack={true}>
        <PageTitle title="My Courses" customStyle={{ marginTop: "10px" }} />
        <div className="w-full flex justify-end">
          <DebounceInput
            onChange={(e) => setSearchString(e)}
            loading={isLoading}
          />
        </div>
        {!categoriesLoading && !isLoading ? (
          Object.keys(courseDetails).length > 0 && conditionSatisfied ? (
            Object.keys(courseDetails)?.map((category: any, i: any) =>
              courseDetails[category].length > 0 ? (
                <div
                  key={i}
                  className="h-max bg-white mt-2 rounded-lg border-green-500 border-solid border"
                >
                  <div className="min-h-9 flex flex-col font-semibold border-l-4 border-sunlight pl-2 grow m-6">
                    <p className="sm:text-lg text-sm uppercase">{category}</p>
                  </div>
                  <div>
                    <div className="flex flex-wrap mb-5 mt-5">
                      {courseDetails[category]?.map((ele: any, ind: number) => (
                        <SmallCard
                          key={ind}
                          shortName={ele.short_name}
                          ind={ind}
                          courseContents={ele.course_contents}
                          image={ele?.logo_access_link}
                          logo={ele?.logo_file}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )
            )
          ) : (
            <div className="h-max bg-white mt-2 rounded-lg border-green-500 border-solid border text-center p-3">
              Welcome to e-Alpha please contact to Administrator to assign the
              course.
            </div>
          )
        ) : (
          <div className="h-32">
            <Loader />
          </div>
        )}
      </RouteLayout>
    </div>
  );
}

export default MySubject;
