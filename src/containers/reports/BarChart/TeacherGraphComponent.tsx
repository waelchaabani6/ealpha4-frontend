import React from "react";
import {
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Tooltip,
} from "recharts";

type ProgramData = {
  [key: string]: number;
};

type GraphData = {
  name: string;
  program?: ProgramData[];
};

type Props = {
  data: GraphData[];
  title: string;
};

const CustomBar = (props: any) => {
  const { fill, x, y, width, height } = props;
  return (
    <rect x={x} y={y} width={width} height={height} fill={fill} rx="1" ry="5" />
  );
};

const CustomLegend = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center">
    <p className="font-semibold">{title}</p>
    <ul className="flex items-center justify-center gap-x-4">
      <li className="flex items-center gap-x-2">
        <p className="bg-[#EDAD49] h-4 w-4 rounded-[4px]" />
        <p>Individual Programs</p>
      </li>
      <li className="flex items-center gap-x-2">
        <p className="bg-[#00798C] h-4 w-4 rounded-[4px]" />
        <p>Total</p>
      </li>
    </ul>
  </div>
);

const GraphComponent = ({ data, title }: Props) => {
  // Validate and transform the input data
  const transformedData = (data || []).map((item) => {
    const programs = item.program || [];
    const totalProgramData = programs.reduce(
      (acc, program) => {
        const [key, value] = Object.entries(program)[0];
        if (key === "total") {
          acc.total = value;
        } else {
          acc[key] = value;
        }
        return acc;
      },
      { name: item.name, total: 0 } as Record<string, number | string>
    );
    return totalProgramData;
  });

  // Extract program keys excluding "name" and "total"
  const programKeys =
    transformedData.length > 0
      ? Object.keys(transformedData[0]).filter(
          (key) => key !== "name" && key !== "total"
        )
      : [];

  return (
    <div className="w-full h-full flex flex-col pl-12 relative">
      <p className="-rotate-90 absolute top-1/2 transform -translate-x-2/3 -translate-y-1/2 font-semibold text-lg p-2 z-10">
        Count
      </p>
      <div className="h-[600px] mt-5">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={transformedData}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            {programKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={index % 2 === 0 ? "#EDAD49" : "#00798C"}
                shape={<CustomBar />}
                barSize={16}
                stackId="a"
              />
            ))}
            <Tooltip cursor={{ fill: "transparent" }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center">
        <CustomLegend title={title} />
      </div>
    </div>
  );
};

export default React.memo(GraphComponent);
