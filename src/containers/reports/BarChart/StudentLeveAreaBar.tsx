import { GRAPH_LABELS } from '@constants/constants';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer
} from 'recharts';

type Props={
  // eslint-disable-next-line react/no-unused-prop-types
  performance:(string | number)[];
  // eslint-disable-next-line react/no-unused-prop-types
  Per?:string;
}

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
        {makeLabel(payload.value)}
        {/* {payload.value} */}
      </text>
    </g>
  );
};

const makeLabel = (value: number) => {
  if (value >= 80) {
    return 'Exceeds';
  }
  if (value >= 60) {
    return 'Meets';
  }
  if (value >= 40) {
    return 'Approaching';
  }
  if (value >= 20) {
    return 'Does Not Meet';
  }
  return '0';
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
function StudentLeveAreaBar(props:Props) {
  const [dataArr, setData] = useState<(string|number)[]>([]);
  const { performance, Per } = props;

  const datagraph = dataArr?.map((ele: any) => {
    const obj: any = { name: ele?.name, area1: ele?.area1, area2: ele?.area2, area3: ele?.area3, area4: ele?.area4 };
    ele?.assignment?.forEach((item: any) => {
      const key = Object.keys(item)[0];
      obj[key] = item[key];
    });
    return obj;
  });

  const subjects = Array.from(
    new Set(
      datagraph?.reduce((acc: any, obj: any) => acc.concat(Object.keys(obj).filter((key) => key !== 'name' && key !== 'area1' && key !== 'area2' && key !== 'area3' && key !== 'area4')), [])
    )
  );
  useEffect(() => {
    setData(performance);
  }, [Per, performance]);
  return (
    <div className="w-full h-[650px] flex flex-col pl-12 relative overflow-x-auto">
      <p className="text-center font-semibold text-2xl py-2">
        {GRAPH_LABELS.PERFORMANCE_EXPECTATION_STUDENT}
      </p>
      <p className="-rotate-90 absolute top-1/2 transform -translate-x-2/3 -translate-y-1/2 font-semibold text-lg p-1 z-10">
        Performance Expectations
      </p>
      <div className="h-[500px]">
        <ResponsiveContainer width={1400} height="100%">
          <ComposedChart width={730} height={250} data={datagraph}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={150}
              tick={myTick}
              domain={[0, 100]}
            />
            <Area
              type="monotone"
              dataKey="area4"
              fill="#D9FFC8"
              stroke="none"
            />
            <Area
              type="monotone"
              dataKey="area3"
              fill="#BECCFF"
              stroke="none"
            />
            <Area
              type="monotone"
              dataKey="area2"
              fill="#FFF9BE"
              stroke="none"
            />
            <Area
              type="monotone"
              dataKey="area1"
              fill="#FCD4C6"
              stroke="none"
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
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center mb-2">
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

export default React.memo(StudentLeveAreaBar);
