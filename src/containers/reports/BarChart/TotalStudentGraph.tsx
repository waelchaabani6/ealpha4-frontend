import React, { useEffect, useState } from 'react';
import {
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
  count1?: number;
  count2?: number;

};

const CustomBar = (props: any) => {
  const { fill, x, y, width, height } = props;
  return (
    <rect x={x} y={y} width={width} height={height} fill={fill} rx="1" ry="5" />
  );
};

const CustomLegend = () => (
  <div className="flex flex-col items-center justify-center">
    <p className="font-semibold">Class</p>
    <ul className="flex items-center justify-center gap-x-4">
      <li className="flex items-center gap-x-2">
        <p className="bg-[#EDAD49] h-4 w-4 rounded-[4px]" />
        <p>Active Students</p>
      </li>
      <li className="flex items-center gap-x-2">
        <p className="bg-[#00798C] h-4 w-4 rounded-[4px]" />
        <p>Total Students</p>
      </li>
    </ul>
  </div>
);

function TotalStudentGraph(props: any) {
  // eslint-disable-next-line no-shadow
  // const transformedData = data?.map((item: any) => ({
  //   name: item.name,
  //   count1: item.count2 - item.count1,
  //   count2: item.count1
  // }));
  return (
    <div className="w-full h-full flex flex-col pl-12 relative">
      <p className="-rotate-90 absolute top-1/2 transform -translate-x-2/3 -translate-y-1/2 font-semibold text-lg p-2 z-10">Number Of Students</p>
      <div className="h-[600px] mt-5">
        <ResponsiveContainer width={400}>
          <BarChart width={730} height={250} data={props?.data || []}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Bar
              dataKey="count1"
              background={{ fill: '#eee' }}
              stackId="a"
              fill="#EDAD49"
              shape={<CustomBar />}
              barSize={16}

            />
            <Bar
              dataKey="count2"
              barSize={16}
              stackId="a"
              shape={<CustomBar />}
              fill="#00798C"
            />
            <Tooltip cursor={{ fill: 'transparent' }} />

          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center">
        <CustomLegend />
      </div>
    </div>
  );
}

export default React.memo(TotalStudentGraph);
