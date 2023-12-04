/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type graphType = {
  name: string;
  dt: number;
}

type Props = {
  // eslint-disable-next-line react/no-unused-prop-types
  data?: graphType[];
  rotate?: boolean;
}
Index.defaultProps = {
  rotate: false
};
const myTick = (props: any) => {
  const { x, y, payload, isRotate } = props;
  return (
    <g transform={`translate(${x},${y}) ${isRotate ? 'rotate(-25) scale(.5)' : ''}`}>
      <text x={16} y={8} textAnchor="end">
        {payload.value}
      </text>
    </g>
  );
};
export default function Index(props: Props) {
  return (
    <ResponsiveContainer width={900} height="100%">
      <BarChart
        width={500}
        height={300}
        data={props?.data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5
        }}
      >
        <XAxis
          dataKey="name"
          tickLine={false}
          strokeDasharray="3 3"
          tick={(pr: any) => myTick({ ...pr, isRotate: props?.rotate })}
        />
        <YAxis
          dataKey="dt"
          tickLine={false}
          strokeDasharray="3 3"
        />
        <Bar
          dataKey="dt"
          fill="#FF6601"
          barSize={10}
          radius={[10, 10, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
