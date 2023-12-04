import React from 'react';
import {
  Bar,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { GRAPH_LABELS } from '@constants/constants';

type Props={
  // eslint-disable-next-line react/no-unused-prop-types
  LineData: (string | number)[];
};
const CustomLegend = () => (
  <div className="flex flex-col items-center justify-center">
    <p className="font-semibold mt-5">Assignments</p>
  </div>
);
const CustomBar = (props: any) => {
  const { fill, x, y, width, height } = props;
  return (
    <rect x={x} y={y} width={width} height={height} fill={fill} rx="5" ry="5" />
  );
};

const MultipleAssignmentLineChart = (props:Props) => {
  const { LineData } = props;

  return (
    <div className="w-full h-full flex flex-col pl-12 relative mt-5">
      <p className="-rotate-90 absolute top-1/2 transform -translate-x-2/3 -translate-y-1/2 font-semibold text-lg p-2 z-10">
        {GRAPH_LABELS.PERCENTAGE}
      </p>

      <div className="h-[600px] overflow-x-auto m-2">
        <ComposedChart width={250 * LineData.length} height={550} data={LineData}>
          <XAxis dataKey="Name" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Bar
            dataKey=""
            barSize={20}
            fill="#F7F7F7"
            background={{ fill: '#F7F7F7' }}
            shape={<CustomBar />}
          />
          <Tooltip cursor={{ fill: 'transparent' }} />

          <Line
            type="monotone"
            dataKey="class"
            strokeWidth={5}
            dot={false}
            stroke="#00798C"
          />
          <Line
            type="monotone"
            dataKey="cohort"
            strokeWidth={5}
            dot={{ stroke: 'white', fill: 'black', strokeWidth: 4, r: 6 }}
            stroke="#EDAD49"
          >
            <LabelList dataKey="uv" position="top" fill="black" />
          </Line>
        </ComposedChart>
      </div>
      <div className="flex items-center justify-center">
        <CustomLegend />
      </div>
    </div>
  );
};

export default React.memo(MultipleAssignmentLineChart);
