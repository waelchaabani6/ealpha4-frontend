import React, { useEffect, useState } from 'react';
import {
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  BarChart,
  Tooltip,
  Label
} from 'recharts';

  type Props={
    // eslint-disable-next-line react/no-unused-prop-types
    data:(string | number)[];
   // eslint-disable-next-line react/no-unused-prop-types
   title?:string;
  }

const CustomBar = (props: any) => {
  const { fill, x, y, width, height } = props;
  return (
    <rect x={x} y={y} width={width} height={height} fill={fill} rx="1" ry="5" />
  );
};
const color = ['#E53945', '#3376BD', '#E53945', '#3376BD', '#E53945', '#3376BD', '#E53945', '#3376BD', '#E53945', '#3376BD', '#E53945', '#3376BD', '#E53945', '#3376BD', '#E53945', '#3376BD', '#E53945', '#3376BD', '#E53945', '#3376BD'];

const CustomLegend = (props: any) => (
  <div>
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
function ActiveDaysUsage(props:Props) {
  // eslint-disable-next-line no-shadow
  const { data } = props;

  const datagraph = data?.map((ele: any) => {
    const obj: any = { name: ele?.name };
    ele?.Program?.forEach((item: any) => {
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
    <div className="w-full h-full flex flex-col pl-12 relative">
      <p className="-rotate-90 absolute top-1/2 transform -translate-x-2/3 -translate-y-1/2 font-semibold text-lg p-2 z-10">Days</p>
      <div className="h-[600px] mt-5">
        <ResponsiveContainer width={700}>
          <BarChart width={730} height={250} data={datagraph}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
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
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col items-center justify-center mb-3">
        <p className="text-l font-semibold">{props?.title === 'students' ? 'Students' : 'Class'}</p>
      </div>
      <div className="flex items-center justify-center mb-2">
        <CustomLegend subjects={subjects} />
      </div>
    </div>
  );
}

export default React.memo(ActiveDaysUsage);
