import React from 'react';
import {
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  BarChart
} from 'recharts';
import { GRAPH_LABELS } from '@constants/constants';

type DataType = {
  name?: string;
  count1?: number;
  count2?: number;
};

const data: DataType[] = [
  {
    name: 'L 3.1',
    count1: 67,
    count2: 56
  },
  {
    name: 'L 3.2',
    count1: 46,
    count2: 87
  },
  {
    name: 'L 3.3',
    count1: 67,
    count2: 55
  },
  {
    name: 'L 3.4',
    count1: 65,
    count2: 45
  },
  {
    name: 'L 3.5',
    count1: 65,
    count2: 67
  },
  {
    name: 'L 3.6',
    count1: 65,
    count2: 65
  },
  {
    name: 'L 3.7',
    count1: 56,
    count2: 23
  }
];

const CustomBar = (props: any) => {
  const { fill, x, y, width, height } = props;
  return (
    <rect x={x} y={y} width={width} height={height} fill={fill} rx="5" ry="5" />
  );
};

const CustomLegend = () => (
  <div className="flex flex-col items-center justify-center">
    <p className="font-semibold">{GRAPH_LABELS.STANDARDS}</p>
    <ul className="flex items-center mt-5 justify-center gap-x-4">
      <li className="flex items-center gap-x-2">
        <p className="bg-[#52499C] h-4 w-4 rounded-[4px]" />
        <p>{GRAPH_LABELS.STANDARDS}</p>
      </li>
    </ul>
  </div>
);

function StandardOverallGraph() {
  const myTick = (props: any) => {
    const { x, y, payload } = props;
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={-16} y={0} dy={4} textAnchor="end" fill="#666">
          {/* {makeLabel(payload.value)} */}
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full h-full flex flex-col pl-12 relative">
      <p className="-rotate-90 absolute top-1/2 transform -translate-x-2/3 -translate-y-1/2 font-semibold text-lg p-2 z-10">
        {GRAPH_LABELS.PERCENTAGE}
        {' '}
        %
      </p>
      <div className="h-[600px]">
        <ResponsiveContainer>
          <BarChart width={730} height={250} data={data}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} tick={myTick} />
            <Bar
              barSize={16}
              dataKey="count1"
              fill="#52499C"
              shape={<CustomBar />}
              stackId="a"
              background={{ fill: '#eee' }}
            />
            {/* <Legend verticalAlign="top" height={36} /> */}
            <Legend content={CustomLegend} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default React.memo(StandardOverallGraph);
