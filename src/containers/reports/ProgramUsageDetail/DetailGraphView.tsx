/* eslint-disable comma-dangle */
import { GRAPH_LABELS } from '@constants/constants';
import TotalStudentGraph from '../BarChart/TotalStudentGraph';
import TotalAssignment from '../BarChart/TotalAssignment';
import TotalAssessment from '../BarChart/TotalAssessment';

const DetailGraphView = ({
  totalStudent,
  totalAssignments,
  totalAssessments,
}) => {
  const i = 0;

  return (
    <div className="py-4 h-full grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-white border border-accent rounded-md">
        <div className="flex flex-col items-center justify-center">
          <p className="font-semibold text-xl">
            {GRAPH_LABELS.TOTAL_VS_ACTIVE}
          </p>
        </div>
        <div className="overflow-x-auto">
          <TotalStudentGraph data={totalStudent || []} />
        </div>
      </div>
      <div className="p-4 bg-white border border-accent rounded-md">
        <p className="font-semibold text-xl">{GRAPH_LABELS.TOTAL_ASSIGNMENT}</p>
        <div className="overflow-x-auto">
          <TotalAssignment data={totalAssignments || []} />
        </div>
      </div>
      <div className="p-4 bg-white border border-accent rounded-md">
        <p className="font-semibold text-xl">{GRAPH_LABELS.TOTAL_ASSESSMENT}</p>
        <div className="overflow-x-auto">
          <TotalAssessment data={totalAssessments || []} />
        </div>
      </div>
    </div>
  );
};

export default DetailGraphView;
