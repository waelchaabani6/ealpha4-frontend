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

type Props = {
  tabledata: (string | number)[];
  // eslint-disable-next-line react/no-unused-prop-types
  PerData: (string | number)[];
  // eslint-disable-next-line react/no-unused-prop-types
  Per: string;
};

const color = ['#EDAD49', '#00798C'];
const CustomBar = (props: any) => {
  const { fill, x, y, width, height } = props;
  return (
    <rect x={x} y={y} width={width} height={height} fill={fill} rx="5" ry="5" />
  );
};

const CustomLegend = () => (
  <div className="flex flex-col items-center justify-center">
    <p className="font-semibold mb-2">Assignments</p>
    <ul className="flex items-center justify-center gap-x-4">
      <li className="flex items-center gap-x-2">
        <p className="bg-[#EDAD49] h-4 w-4 rounded-[4px]" />
        <p>Class Score</p>
      </li>
      <li className="flex items-center gap-x-2">
        <p className="bg-[#00798C] h-4 w-4 rounded-[4px]" />
        <p>Cohort Score</p>
      </li>
    </ul>
  </div>
);

function MultipleAssignmentsBarGraph(props: Props) {
  const [data, setData] = useState<(string | number)[]>([]);
  const [Value, SetValue] = useState('Score');
  const { tabledata, PerData, Per } = props;
  // eslint-disable-next-line no-shadow
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

  useEffect(() => {
    if (Per === 'true') {
      setData(PerData);
      SetValue('Percentage');
    } else {
      setData(tabledata);
      SetValue('Score');
    }
  }, [Per]);
  const datagraph = data?.map((ele: any) => {
    const obj: any = { name: ele?.name, score: ele?.score, cohort: ele?.cohort };
    const key = Object.keys(ele)[0];
    obj[key] = ele[key];
    return obj;
  });
  const subjects = Array.from(
    new Set(
      datagraph?.reduce((acc: any, obj: any) => acc.concat(Object.keys(obj).filter((key) => key !== 'name')), [])
    )
  );

  return (
    <div className="w-full h-full flex flex-col pl-12 relative">
      {
        data.length
          ? (
            <>
              <p className="-rotate-90 absolute top-1/2 transform -translate-x-2/3 -translate-y-1/2 font-semibold text-lg p-2 z-10">
                {Value}
              </p>
              <div className="h-[460px] mt-4">
                <BarChart width={datagraph ? 250 * datagraph.length : 900} height={450} data={datagraph}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={myTick}
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
              </div>
              <div className="flex items-center justify-center">
                <CustomLegend />
              </div>
            </>
          )
          : (
            <p><i>No data</i></p>
          )
      }
    </div>
  );
}

export default React.memo(MultipleAssignmentsBarGraph);
