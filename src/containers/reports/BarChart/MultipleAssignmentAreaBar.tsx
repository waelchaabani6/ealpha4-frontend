import { GRAPH_LABELS } from "@constants/constants";
import React from "react";
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

type Props = {
  performance: (string | number)[];
};

const CustomBar = (props: any) => {
  const { fill, x, y, width, height } = props;
  return (
    <rect x={x} y={y} width={width} height={height} fill={fill} rx="5" ry="5" />
  );
};
const CustomLegend = () => (
  <div className="flex flex-col items-center justify-center">
    <p className="font-semibold mb-2">Assignments</p>
    <ul className="flex items-center justify-center gap-x-4">
      <li className="flex items-center gap-x-2">
        <p className="bg-[#EDAD49] h-4 w-4 rounded-[4px]" />
        <p>Class Score</p>
      </li>
      <li className="flex items-center gap-x-2">
        <p className="bg-[#00798C] h-4 w-4 rounded-[4px]" />
        <p>Cohort Score</p>
      </li>
    </ul>
  </div>
);

function MultipleAssignmentAreaBar(prop: Props) {
  const expectations = [
    { label: "Exceeds", from: 81, to: 100, color: "#BECCFF" },
    { label: "Above", from: 66, to: 80, color: "#D9FFC8" },
    { label: "Meets", from: 56, to: 65, color: "#FFF9BE" },
    { label: "Approaching", from: 35, to: 55, color: "#FFD6A5" },
    { label: "Does Not Meet", from: 0, to: 34, color: "#FCD4C6" },
  ];

  const { performance } = prop;
  const makeLabel = (value) => {
    if (value >= 81) {
      return "Exceeds";
    }
    if (value >= 66) {
      return "Above";
    }
    if (value >= 56) {
      return "Meets";
    }
    if (value >= 35) {
      return "Approaching";
    }
    if (value > 0) {
      return "Does Not Meet";
    }
    return "Zero";
  };

  const myTick = (props: any) => {
    const { x, y, payload } = props;
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={-16} y={0} dy={4} textAnchor="end" fill="#666">
          {makeLabel(payload.value)}
          {/* {payload.value} */}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full h-full flex flex-col pl-12 relative overflow-x-auto">
      <p className="text-center font-semibold text-2xl py-2">
        {GRAPH_LABELS.OVERALL_SCORE}
      </p>
      <p className="-rotate-90 absolute top-1/2 transform -translate-x-2/3 -translate-y-1/2 font-semibold text-lg ml-3 z-10">
        Performance Expectations
      </p>
      <div className="h-[460px] mt-10">
        <ComposedChart
          width={performance ? 230 * performance.length : 800}
          height={450}
          data={performance}
        >
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={140}
            tick={myTick}
            domain={[0, 100]}
            ticks={[34, 55, 65, 80, 100]}
          />
          {expectations.map((expectation, index) => (
            <Area
              key={index}
              type="monotone"
              dataKey={`area${expectations.length - index}`} // area4, area3, etc.
              fill={expectation.color}
              stroke="none"
            />
          ))}
          <Bar
            barSize={16}
            dataKey="class_percent"
            fill="#EDAD49"
            shape={<CustomBar />}
          />
          <Bar
            barSize={16}
            dataKey="cohort_percent"
            fill="#00798C"
            shape={<CustomBar />}
          />
        </ComposedChart>
      </div>
      <div className="flex items-center justify-center">
        <CustomLegend />
      </div>
    </div>
  );
}

export default React.memo(MultipleAssignmentAreaBar);
