/* eslint-disable comma-dangle */
/* eslint-disable indent */
/* eslint-disable operator-linebreak */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-confusing-arrow */
import RouteLayout from "@layout/routeLayout";
import PageTitle from "@shared/pageTitle";
import Dropdown from "@component/dropdown/Dropdown";
import Loader from "@shared/loader";
import { useGet, api } from "@shared/api/useApi";
import { useSelector } from "react-redux";
import { selectUser } from "@shared/store/userSlice";
// import SmallBook from './SmallBook';
import { useState, useEffect } from "react";
import { sortData } from "@utility/utility";
import SmallCard from "./SmallCard";

function MySubject() {
  const ALL = {
    label: "Select",
    value: "All",
  };
  const [allCategories, setAllCategories] = useState<any>([ALL]);
  const [selectedCategory, setSelectedCategory] = useState<any>("All");
  const [courseDetails, setCourseDetails] = useState<any>([]);
  const [courseDetailsdata, setCourseDetailsdata] = useState<any>([]);

  const [isLoading, setIsLoading] = useState(true);

  const { userId: userID } = useSelector(selectUser);

  //  Get Categories
  const {
    isLoading: categoriesLoading,
    isRefetching: categoryRefetching,
    refetch: categoriesFetch,
    data,
    isSuccess,
  } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/category-list/?user_id=${userID}`,
    cacheTime: 2000,
    onSuccess: (res: any) => {
      const resp = res?.data?.response;
      const body: any = [];
      resp?.map((i: any) => {
        body.push({
          label: i?.content,
          value: i?.content,
        });
        body?.sort(sortData);
        return body;
      });
      setAllCategories([ALL, ...body]);
    },
    onError: () => {},
  });

  const getAllcoursesDetails = (categoryArray: any) => {
    setIsLoading(true);
    const resultAPIs = categoryArray?.map((items: any) =>
      api(import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL)
        .get(
          `course-code-service/courses/assigned_courses/${userID}/details/?Category=${items.content}`
        )
        .then((courses: any) => ({ category: items.content, courses }))
    );

    console.log(resultAPIs, "resultAPIs");

    Promise.allSettled(resultAPIs)
      .then((res: any) => {
        if (res?.length) {
          const courseByCategoryDict: { [key: string]: [] } = {};
          res?.forEach((element: any) => {
            courseByCategoryDict[element?.value?.category] =
              element?.value?.courses?.data?.response;
          });
          setCourseDetailsdata(courseByCategoryDict);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    setIsLoading(false);
    if (data?.data?.response?.length) {
      getAllcoursesDetails(data?.data?.response);
    }
  }, [isSuccess]);

  const conditionSatisfied = Object.keys(courseDetailsdata).some(
    (category: any) => courseDetailsdata[category].length > 0
  );

  const {
    isLoading: courseDetailsLoading,
    isRefetching,
    refetch: courseDetailsFetch,
  } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/assigned_courses/${userID}/details/?${selectedCategory !== "All" ? `Category=${selectedCategory}` : ""}`,
    onSuccess: (res: any) => {
      const respData = res?.data?.response;
      setCourseDetails(respData);
    },
    onError: () => {},
    enabled: false,
  });

  useEffect(() => {
    if (selectedCategory !== "All") {
      courseDetailsFetch();
    }
  }, [selectedCategory]);
  console.log(categoriesLoading, "categoriesLoading");

  return (
    <div>
      <RouteLayout navBack={true}>
        <PageTitle title="My Courses" customStyle={{ marginTop: "10px" }} />
        <div>
          <Dropdown
            dataArray={allCategories}
            value={selectedCategory}
            parentStyle="float-right"
            onChangeHandler={(e) => setSelectedCategory(e)}
            title="Select From"
            sxClass={{ width: "135px" }}
            loading={categoryRefetching || categoriesLoading || isLoading}
          />
        </div>

        {!categoriesLoading && !isLoading ? (
          Object.keys(courseDetailsdata).length > 0 && !courseDetailsLoading ? (
            selectedCategory === "All" ? (
              Object.keys(courseDetailsdata).length > 0 &&
              conditionSatisfied ? (
                Object.keys(courseDetailsdata)?.map((category: any, i: any) =>
                  courseDetailsdata[category].length > 0 ? (
                    <div
                      key={i}
                      className="h-max bg-white mt-2 rounded-lg border-green-500 border-solid border"
                    >
                      <div className="min-h-9 flex flex-col font-semibold border-l-4 border-sunlight pl-2 grow m-6">
                        <p className="sm:text-lg text-sm uppercase">
                          {category}
                        </p>
                      </div>
                      <div>
                        <div className="flex gap-x-6 gap-y-8 flex-wrap pb-12 overflow-x-auto relative">
                          {courseDetailsdata[category]?.map(
                            (ele: any, ind: number) => (
                              <SmallCard
                                shortName={ele?.short_name}
                                courseContents={ele?.course_contents}
                                ind={ind}
                                image={ele?.icon_file || ele?.logo_access_link}
                                logo={ele?.icon_link || ele?.logo_file}
                              />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )
                )
              ) : (
                <div className="h-max bg-white mt-2 rounded-lg border-green-500 border-solid border text-center p-3">
                  Welcome to e-Alpha please contact to Administrator to assign
                  the course.
                </div>
              )
            ) : courseDetails.length > 0 ? (
              <div className="h-max bg-white mt-2 rounded-lg border-green-500 border-solid border">
                <div className="min-h-9 flex flex-col font-semibold border-l-4 border-sunlight pl-2 grow m-6">
                  <p className="sm:text-lg text-sm">{selectedCategory}</p>
                </div>
                <div>
                  <div className="flex gap-8 flex-wrap pb-12 overflow-x-auto relative">
                    {courseDetails?.map((items: any, ind: any) => (
                      <SmallCard
                        shortName={items?.short_name}
                        courseContents={items?.course_contents}
                        ind={ind}
                        image={items?.icon_file || items?.logo_access_link}
                        logo={items?.icon_link || items?.logo_file}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-max bg-white mt-2 rounded-lg border-green-500 border-solid border text-center p-3">
                Welcome to e-Alpha please contact to Administrator to assign the
                course.
              </div>
            )
          ) : (
            <div className="h-32">
              {courseDetailsLoading ||
              isRefetching ||
              categoriesLoading ||
              categoryRefetching ? (
                <Loader />
              ) : (
                <div className="h-max bg-white mt-2 rounded-lg border-green-500 border-solid border text-center p-3">
                  Welcome to e-Alpha please contact to Administrator to assign
                  the course.
                </div>
              )}
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
