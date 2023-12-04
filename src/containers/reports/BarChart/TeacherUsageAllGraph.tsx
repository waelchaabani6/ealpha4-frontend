import React, { useEffect, useState } from 'react';
import { Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  BarChart,
  Tooltip } from 'recharts';

const CustomBar = (props: any) => {
  const { fill, x, y, width, height } = props;
  return (
    <rect x={x} y={y} width={width} height={height} fill={fill} rx="1" ry="5" />
  );
};

const color = ['#3376BD', '#B839E5', '#E58139', '#3C39E5', '#3376BD', '#B839E5', '#E58139', '#3C39E5'];

const CustomLegend = (props: any) => (
  <div>
    <div className="flex flex-col items-center justify-center mb-3">
      <p className="text-xs font-semibold">TEACHERS</p>
    </div>
    <ul className="flex items-center justify-start gap-x-4">
      {
        props?.subjects?.map((el: any, i: any) => (
          <li className="flex items-center gap-x-2">
            <p className="h-4 w-4 rounded-[4px]" style={{ backgroundColor: `${color[i] || color[0]}` }} />
            <p className="text-xs">{el}</p>
          </li>
        ))
      }
    </ul>
  </div>
);

function TeacherUsageAllGraph(props: any) {
  // eslint-disable-next-line no-shadow

  const datagraph = props?.graphData?.map((ele: any) => {
    const obj: any = { name: ele?.name };
    ele?.program?.forEach((item: any) => {
      const key = Object.keys(item)[0];
      obj[key] = item[key];
    });
    return obj;
  });

  const subjects = Array.from(
    new Set(
      datagraph?.reduce((acc: any, obj: any) => acc.concat(Object.keys(obj).filter((key) => key !== 'name')), [])
    )
  );

  return (
    <div className="w-full flex flex-col pl-8 relative">
      <p className="-rotate-90 absolute top-1/2 transform -translate-x-2/3 -translate-y-1/2 text-xs font-semibold">NUMBERS</p>
      <div className="h-[415px] mt-5">
        <BarChart width={150 * datagraph.length} height={415} data={datagraph} margin={{ left: 0 }}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
          <YAxis
            axisLine={false}
            tickLine={false}
            fontSize={12}
          />
          <Tooltip cursor={{ fill: 'transparent' }} />

          {
            subjects.map((subs: any, ind: any) => (
              <Bar
                dataKey={subs}
                fill={color[ind] || color[0]}
                shape={<CustomBar />}
                barSize={16}

              />
            ))
          }
        </BarChart>
      </div>
      <div className="flex items-center justify-center">
        <CustomLegend subjects={subjects} />
      </div>
    </div>
  );
}

export default React.memo(TeacherUsageAllGraph);
