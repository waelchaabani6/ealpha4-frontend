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

  type Props={
    // eslint-disable-next-line react/no-unused-prop-types
    data?:(string|number) [];
  }

const color = ['#00798C', '#EDAD49', '#E53945', '#00798C', '#EDAD49', '#E53945', '#00798C', '#EDAD49', '#E53945', '#00798C', '#EDAD49', '#E53945', '#00798C', '#EDAD49', '#E53945', '#00798C', '#EDAD49', '#E53945'];

const CustomBar = (props: any) => {
  const { fill, x, y, width, height } = props;
  return (
    <rect x={x} y={y} width={width} height={height} fill={fill} rx="1" ry="5" />
  );
};

const CustomLegend = (props: any) => (
  <div>
    <div className="flex items-center justify-center gap-x-4 mt-2 text-l font-semibold">
      <h2>Class</h2>
    </div>
    <ul className="flex items-center justify-start gap-x-4 mb-4">
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

function TimePerClass(props:Props) {
  const datagraph = props?.data?.map((ele: any) => {
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
  // eslint-disable-next-line no-shadow
  return (
    <div className="w-full h-full flex flex-col pl-12 relative">
      <p className="-rotate-90 absolute top-1/2 transform -translate-x-2/3 -translate-y-1/2 font-semibold text-lg p-2 z-10">Assets</p>
      <div className="h-[600px] mt-5">
        <ResponsiveContainer width={700}>
          <BarChart width={730} height={250} data={datagraph}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
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
            <Tooltip cursor={{ fill: 'transparent' }} />

          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center">
        <CustomLegend subjects={subjects} />
      </div>
    </div>
  );
}

export default React.memo(TimePerClass);
