/* eslint-disable react/no-unused-prop-types */
import { useMemo } from "react";
import moment from "moment";
import { Link, useParams } from "react-router-dom";
import { USER_TYPE } from "@constants/constants";
import { useSelector } from "react-redux";
import { selectUser } from "@shared/store/userSlice";
import { DashboardTabsDataType } from ".";

type Props = {
  data: DashboardTabsDataType;
  selectedChild?: string;
};
function InCompleted(props: Props) {
  const { schoolName } = useParams();
  const user = useSelector(selectUser);
  const assessmentList = useMemo(
    () => (
      <div className="h-full flex flex-col justify-between gap-y-1 p-4 w-1/2">
        <div className="flex items-center justify-between">
          <div className="justify-between w-full flex px-5">
            <h4 className="text-base font-bold">
              {`Assessments (${props?.data?.assessment?.length || 0})`}
            </h4>
            <Link
              to={
                user?.role?.name === USER_TYPE.TEACHER
                  ? `/${schoolName}/assessments/assigned`
                  : `/${schoolName}/assessments`
              }
              // to={`/${schoolName}/assessments/assigned`}
              className="text-accent underline font-medium text-center"
            >
              <span className="whitespace-nowrap">View All</span>
            </Link>
            <h4 className="text-base font-bold">Due Date</h4>
          </div>
        </div>

        <div className="bg-slate-100 h-40 rounded-md overflow-auto p-3">
          {props?.data?.assessment?.length < 1 ? (
            <i className="flex items-center h-full justify-center ">No Data</i>
          ) : (
            props?.data?.assessment?.map((itm: any) => (
              <div key={itm?.id} className="flex justify-between mb-2">
                <span>{itm?.assessment_name}</span>
                <span
                  className={`${itm?.start_date > itm?.end_date ? "text-red-600" : ""}`}
                >
                  {/* {`${moment(itm?.start_date).format('yyyy-MM-DD')} - ${moment(itm?.end_date).format('yyyy-MM-DD')}`} */}
                  {`${moment(itm?.submission_date).format("yyyy-MM-DD")}`}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    ),
    [props.data.assessment]
  );
  const assignmentList = useMemo(
    () => (
      <div className="h-full flex flex-col justify-between gap-y-1 p-4 w-1/2">
        <div className="flex items-center justify-between">
          <div className="justify-between w-full flex px-5">
            <h4 className="text-base font-bold">
              {`Assignments (${props?.data?.assignment?.length})`}
            </h4>
            <Link
              to={`/${schoolName}/assignment`}
              className="text-accent underline font-medium text-center"
            >
              <span className="whitespace-nowrap">View All</span>
            </Link>
            <h4 className="text-base font-bold">Due Date</h4>
          </div>
        </div>
        <div className="bg-slate-100 h-40 rounded-md overflow-auto p-3">
          {props?.data?.assignment?.length < 1 ? (
            <i className="flex items-center h-full justify-center ">No Data</i>
          ) : (
            props?.data?.assignment?.map((itm: any) => {
              let link = "";
              const state = null;
              link = `/${schoolName}/assignment`;
              // if (user?.role?.name === USER_TYPE?.STUDENT) {
              //   link = `/${schoolName}/assignment/assignment-details/${itm.assignment_id}/empty/false`;
              // } else if (user?.role?.name === USER_TYPE?.TEACHER) {
              //   link = `/${schoolName}/assignment/assigned-students`;
              //   state = { assignmentId: itm.id, assignmentName: itm.assignment_name, startDate: itm.start_date, endData: itm.end_date, grade: itm.grade_name, isFromComplete: false, path: `/${schoolName}/dashboard` };
              // } else if (user?.role?.name === USER_TYPE?.PARENTS) {
              //   link = `/${schoolName}/assignment/assignment-details/${itm?.id}/${props?.selectedChild}`;
              // }
              return (
                <div key={itm?.id} className="flex justify-between mb-2">
                  <span className="text-accent underline">
                    <Link to={link} state={state}>
                      {itm?.assignment_name}
                    </Link>
                  </span>
                  <span
                    className={`${itm?.start_date > itm?.end_date ? "text-red-600" : ""}`}
                  >
                    {/* {`${moment(itm?.start_date).format('yyyy-MM-DD')} - ${moment(itm?.end_date).format('yyyy-MM-DD')}`} */}
                    {`${moment(itm?.end_date).format("yyyy-MM-DD")}`}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    ),
    [props.data.assignment]
  );

  return (
    <div className="w-full flex flex-col bg-white overflow-hidden">
      <div className="flex p-1 w-full gap-2 min-h-[100px] h-full overflow-hidden">
        {assignmentList}
        {assessmentList}
      </div>
    </div>
  );
}

export default InCompleted;
