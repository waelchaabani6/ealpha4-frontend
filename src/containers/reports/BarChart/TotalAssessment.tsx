import { GRAPH_LABELS } from '@constants/constants';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  BarChart,
  Tooltip
} from 'recharts';

type DataType = {
  name?: string;
  count1?: number;};

const CustomLegend = () => (
  <div className="flex flex-col items-center justify-center mt-5">
    <p className="font-semibold">{GRAPH_LABELS.CLASSES}</p>
  </div>
);
const CustomBar = (props: any) => {
  const { fill, x, y, width, height } = props;
  const isFirstGraph = props.dataKey === 'Assignment1';
  const barColor = isFirstGraph ? '#E53945' : fill;

  return (
    <rect x={x} y={y} width={width} height={height} fill={barColor} rx="5" ry="5" />
  );
};

function TotalAssessment(props: any) {
  return (
    <div className="w-full h-full flex flex-col pl-12 relative">
      <p className="-rotate-90 absolute top-1/2 transform -translate-x-2/3 -translate-y-1/2 font-semibold text-lg p-2 z-10">{props?.title ? props?.title : 'Number Of Assessments'}</p>
      <div className="h-[600px] mt-5">
        <ResponsiveContainer width={700}>
          <BarChart width={730} height={250} data={props?.data || []}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip cursor={{ fill: 'transparent' }} />
            <Bar
              dataKey="count1"
              background={{ fill: '#eee' }}
              stackId="a"
              fill="#00798C"
              shape={<CustomBar />}
              barSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center">
        <CustomLegend />
      </div>
    </div>
  );
}

export default React.memo(TotalAssessment);
