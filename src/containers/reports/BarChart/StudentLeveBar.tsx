import React, { useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

type Props={
  // eslint-disable-next-line react/no-unused-prop-types
  Per?:string;
  // eslint-disable-next-line react/no-unused-prop-types
  tabledata:(string | number)[];
  // eslint-disable-next-line react/no-unused-prop-types
  PerData:(string | number)[];
}
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

const CustomBar = (props: any) => {
  const { fill, x, y, width, height } = props;
  const isFirstGraph = props.dataKey === 'Assignment1';
  const barColor = isFirstGraph ? '#E53945' : fill;

  return (
    <rect x={x} y={y} width={width} height={height} fill={barColor} rx="5" ry="5" />
  );
};
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
function StudentLeveBar (props:Props) {
  const { tabledata, PerData, Per } = props;
  const [dataArr, setData] = useState<(string|number)[]>([]);
  const [Value, SetValue] = useState('Score');
  const datagraph = dataArr?.map((ele: any) => {
    const obj: any = { name: ele?.name };
    ele?.assignment?.forEach((item: any) => {
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

  const SetStudentData = () => {
    if (Per === 'true') {
      setData(PerData);
      SetValue('Percentage');
    } else {
      setData(tabledata);
      SetValue('Score');
    }
  };
  useEffect(() => {
    SetStudentData();
  }, [Per, tabledata, PerData]);

  return (
    <div className="w-full h-[600px] flex flex-col pl-12 relative overflow-x-auto">
      <p className="-rotate-90 absolute top-1/2 transform -translate-x-2/3 -translate-y-1/2 font-semibold text-lg p-2 z-10">
        {Value}
      </p>
      <div className="h-[500px]">
        <ResponsiveContainer width={1300} height="100%">
          <BarChart width={730} height={250} data={datagraph}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={myTick}
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
        <div className="flex items-center justify-center mb-2 mt-3">
          <h2 className="text-l font-semibold">Student</h2>
        </div>
        <div className="flex items-center justify-center mb-2">
          <div>
            <CustomLegend subjects={subjects} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(StudentLeveBar);
