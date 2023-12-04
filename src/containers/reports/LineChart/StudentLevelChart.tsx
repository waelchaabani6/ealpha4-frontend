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

type Props={
  linedata?:(string | number)[];
}
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

const StudentLevelChart = (props:Props) => {
  const { linedata } = props;

  return (
    <div className="w-full h-full flex flex-col pl-12 relative overflow-x-auto">
      <p className="-rotate-90 absolute top-1/2 transform -translate-x-2/3 -translate-y-1/2 font-semibold text-lg p-2 z-10">
        Percentage
      </p>

      <div className="h-[600px]">
        <ComposedChart width={linedata ? 250 * linedata.length : 1100} height={530} data={linedata}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
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
            dataKey="class_score"
            strokeWidth={5}
            dot={false}
            stroke="#3376BD"
          />
          <Line
            type="monotone"
            dataKey="student_score"
            strokeWidth={5}
            dot={{ stroke: 'white', fill: 'black', strokeWidth: 4, r: 6 }}
            stroke="#FF0008"
          >
            {' '}
            <LabelList dataKey="student_score" position="top" fill="black" />
          </Line>
        </ComposedChart>
        <div className="flex justify-center">
          <CustomLegend />
        </div>
      </div>
    </div>
  );
};

export default React.memo(StudentLevelChart);
