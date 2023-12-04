import React from 'react';
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

const CustomLegend = (props:any) => (

  <div className="flex flex-col items-center justify-center mt-0">
    <p className="font-semibold mb-2">
      {props?.title ? 'Students' : 'Class'}
      {' '}
    </p>
    <ul className="flex items-center justify-center gap-x-4 text-xs mb-5">
      <li className="flex items-center gap-x-2">
        <p className="bg-[#EDAD49] h-4 w-4 rounded-[4px]" />
        <p>Content Completed</p>
      </li>
      <li className="flex items-center gap-x-2">
        <p className="bg-[#00798C] h-4 w-4 rounded-[4px]" />
        <p>Content Opened</p>
      </li>
    </ul>
  </div>
);

function ContentOpened(props:Props) {
  // eslint-disable-next-line no-shadow

  const { data } = props;

  return (
    <div className="w-full h-full flex flex-col pl-12 relative">
      <p className="-rotate-90 absolute top-1/2 transform -translate-x-2/3 -translate-y-1/2 font-semibold text-lg p-2 z-10">Assets</p>
      <div className="h-[540px] mt-5">
        <ResponsiveContainer width={700}>
          <BarChart width={730} height={250} data={data}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Bar
              dataKey="Completed"
              fill="#EDAD49"
              shape={<CustomBar />}
              barSize={16}

            />
            <Tooltip cursor={{ fill: 'transparent' }} />
            <Bar
              dataKey="Opened"
              barSize={16}
              shape={<CustomBar />}
              fill="#00798C"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className=" mt-12">
        <CustomLegend title={props.title} />
      </div>

    </div>
  );
}

export default React.memo(ContentOpened);
