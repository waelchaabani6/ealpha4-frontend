import React, { useEffect, useState } from 'react';
import {
  Legend,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer
} from 'recharts';

type Props = {
  tabledata: any;
};
const CustomLegend = () => (
  <div className="flex flex-col items-center justify-center">
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
const formatLabel = (value: any) => `${value}%`;
function RadialBarChartOne(props: Props) {
  const { tabledata } = props;
  const [data, setdata] = useState([]);

  const RadialData = () => {
    const newArr = tabledata.map((obj: any) => ({ ...obj, lastcount: 100 }));
    setdata(newArr);
  };

  useEffect(() => {
    if (data?.length) {
      RadialData();
    }
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height={900}>
      <RadialBarChart
        cx="50%"
        cy="50%"
        innerRadius="45%"
        outerRadius="100%"
        barSize={35}
        data={data}
      >
        <RadialBar
          dataKey=""
          cornerRadius={10}
          stroke="none"
          background={true}
        />
        <RadialBar
          dataKey="score"
          cornerRadius={10}
          stroke="none"
          label={{ position: 'outside', fill: '#000', fontWeight: '700', formatter: formatLabel }}
          fill="#EDAD49"
          background={true}
        />
        <RadialBar
          dataKey=""
          cornerRadius={10}
          stroke="none"
          fill="#000000"
        />
        <RadialBar
          dataKey=""
          cornerRadius={10}
          stroke="none"
          background={true}
        />
        <RadialBar
          dataKey="cohort"
          cornerRadius={10}
          stroke="none"
          fill="#00798C"
          label={{ position: 'outside', fill: '#000', fontWeight: '700', formatter: formatLabel }}
          background={true}
        />
        <RadialBar
          dataKey=""
          cornerRadius={10}
          stroke="none"
          fill="#000000"
        />
        <RadialBar
          dataKey=""
          cornerRadius={10}
          stroke="none"
          fill="#000000"
        />
        <RadialBar
          dataKey="lastcount"
          cornerRadius={10}
          fill="white"
          background={true}
          stroke="white"
        />
        {data?.map((entry: any, index: React.Key | null | undefined) => (
          <React.Fragment key={index}>
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgb(64 64 64)"
              className="break-words whitespace-normal text-xs sm:text-xs lg:text-xs xl:text-xs 2xl:text-xs font-semibold"
            >
              <tspan x="50%" dy="-0.5em">Single</tspan>
              <tspan x="50%" dy="1em">Assignment</tspan>
            </text>
          </React.Fragment>
        ))}

        <Legend content={CustomLegend} className="mt-0" />

      </RadialBarChart>
    </ResponsiveContainer>
  );
}

export default React.memo(RadialBarChartOne);
