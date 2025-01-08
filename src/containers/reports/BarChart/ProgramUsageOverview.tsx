/* eslint-disable comma-dangle */
import { GRAPH_LABELS, STRINGS } from '@constants/constants';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

type DataType = {
  name?: string;
  count1?: number;
};
type Props = {
  xaxis?: string;
  yaxis?: string;
  barData?: (string | number)[];
};

const CustomBar = (props: any) => {
  const { fill, x, y, width, height } = props;
  const isFirstGraph = props.dataKey === 'Assignment1';
  const barColor = isFirstGraph ? '#E53945' : fill;

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={barColor}
      rx="5"
      ry="5"
    />
  );
};

function ProgramUsageOverview(props: Props) {
  const { xaxis, barData, yaxis } = props;
  const [dataarr, setData] = useState<any>([]);
  const [filteredData, setFilteredData] = useState([]);
  const [Value, setValue] = useState('Students');
  useEffect(() => {
    setData(barData);
  }, [barData]);

  useEffect(() => {
    const body: any = [];
    if (yaxis === STRINGS.OPTION1) {
      dataarr?.map((i: any, index: any) => {
        body.push({
          name: i?.name,
          value: i?.students,
        });
        setFilteredData(body);
        setValue('Students');
        return true;
      });
    }
    if (yaxis === STRINGS.OPTION2) {
      barData?.map((i: any, index: any) => {
        body.push({
          name: i?.name,
          value: i.teachers,
        });
        setFilteredData(body);
        setValue('Teachers');
        return true;
      });
    }
    if (yaxis === STRINGS.OPTION3) {
      barData?.map((i: any, index: any) => {
        body.push({
          name: i?.name,
          value: i?.total_time_students,
        });
        setFilteredData(body);
        setValue('Total Time - Students (Days)');
        return true;
      });
    }
    if (yaxis === STRINGS.OPTION4) {
      barData?.map((i: any, index: any) => {
        body.push({
          name: i?.name,
          value: i.total_time_teachers,
        });
        setFilteredData(body);
        setValue('Total Time - Teachers (Days)');
        return true;
      });
    }
    if (yaxis === STRINGS.OPTION5) {
      barData?.map((i: any, index: any) => {
        body.push({
          name: i?.name,
          value: i.total_time_teachers_and_students,
        });
        setFilteredData(body);
        setValue('Total Time -  Student + Teachers (Days');
        return true;
      });
    }
  }, [yaxis, xaxis, dataarr]);

  return (
    <div className="w-full h-full flex flex-col pl-12 relative overflow-x-auto">
      <p className="-rotate-90 absolute top-1/2 transform -translate-x-2/3 -translate-y-1/2 font-semibold text-lg p-2 z-10 ml-5">
        {Value}
      </p>
      <div className="h-[600px] w-[80%]">
        <ResponsiveContainer width={1500}>
          <ComposedChart width={730} height={250} data={filteredData}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={150}
              domain={[0, 100]}
            />
            <Tooltip cursor={{ fill: 'transparent' }} />
            <Bar
              barSize={16}
              dataKey="value"
              fill="#EDAD49"
              shape={<CustomBar />}
              stackId="a"
              background={{ fill: '#eee' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default React.memo(ProgramUsageOverview);
