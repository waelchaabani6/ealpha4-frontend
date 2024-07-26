import { GRAPH_LABELS } from '@constants/constants';
import React, { useEffect, useState } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

type Props = {
  // eslint-disable-next-line react/no-unused-prop-types
  checked?: boolean;
  // eslint-disable-next-line react/no-unused-prop-types
  linedata?: (string | number)[];
};

const CustomLegend = () => (
  <div className="flex flex-col items-center justify-center">
    <p className="font-semibold">Questions</p>
  </div>
);

function AssignQuestionLevel(props: Props) {
  const { checked, linedata } = props;

  return (
    <div className="w-full h-full flex flex-col pl-12 relative overflow-x-auto">
      <p className="-rotate-90 absolute top-1/2 transform -translate-x-2/3 -translate-y-1/2 font-semibold text-lg p-2 z-10">
        {GRAPH_LABELS.PERCENTAGE}
      </p>
      <div className="h-[600px]">
        <ComposedChart
          width={linedata ? 200 * linedata.length : 1200}
          height={250}
          data={linedata}
        >
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} width={150} />
          <Area type="monotone" dataKey="area4" fill="#D9FFC8" stroke="none" />
          <Area type="monotone" dataKey="area3" fill="#BECCFF" stroke="none" />
          <Area type="monotone" dataKey="area2" fill="#FFF9BE" stroke="none" />
          <Area type="monotone" dataKey="area1" fill="#FCD4C6" stroke="none" />
          {checked && (
            <Line
              type="monotone"
              dataKey="score_in_percent"
              strokeWidth={5}
              dot={{ stroke: 'white', fill: 'black', strokeWidth: 4, r: 6 }}
              stroke="#EDAD49"
            >
              <LabelList
                dataKey="score_in_percent"
                position="top"
                fill="black"
              />
            </Line>
          )}
          <Line
            type="monotone"
            dataKey="class_score_in_percent"
            strokeWidth={5}
            dot={{ stroke: 'white', fill: 'black', strokeWidth: 4, r: 6 }}
            stroke="#52499C"
          >
            <LabelList
              dataKey="class_score_in_percent"
              position="top"
              fill="black"
            />
          </Line>
          {/* <Legend verticalAlign="top" height={36} /> */}
        </ComposedChart>
        <div className="flex justify-center">
          <CustomLegend />
        </div>
      </div>
    </div>
  );
}

export default React.memo(AssignQuestionLevel);
