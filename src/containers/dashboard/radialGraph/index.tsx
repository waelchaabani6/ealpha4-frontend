import {
  RadialBar,
  RadialBarChart,
  ResponsiveContainer
} from 'recharts';

type graphType = {
  dt: number;
  fill: string;
}

type Props = {
  data: graphType[];
}

export default function Index(props: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadialBarChart
        cx="50%"
        cy="50%"
        innerRadius="50%"
        outerRadius="90%"
        barSize={7}
        data={props.data}
      >
        <RadialBar
          radius={100}
          background={true}
          dataKey="dt"
          cornerRadius={10}
          style={{
            filter: 'drop-shadow(0px 0px 10px rgba(0,0,0,0.4))'
          }}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}
