import { SUBJECT_BAR_COLORS } from '@constants/constants';
import { AloneLoader } from '@shared/loader';
import React, { useMemo } from 'react';
import {
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart
} from 'recharts';

type Props = {
  data: any[];
  innerTitle?: boolean;
  title?: string;
  verticalText?: string;
  horizontalText?: string;
  xAxisKey?: string;
  legend?: { title: string; color: string }[] | undefined;
  loading?: boolean;
  shadow?: boolean;
  showLegend?: boolean;
}

const getBarColor = (subject: string) => {
  const { ENGLISH, MATHS, SCIENCE } = SUBJECT_BAR_COLORS;
  switch (subject) {
    case 'English':
      return ENGLISH;
    case 'Science':
      return SCIENCE;
    case 'Maths':
      return MATHS;
    default:
      return '';
  }
};

const CustomBar = (props: any) => {
  const { fill, x, y, width, height } = props;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} rx="4" />
      {
        props?.showInnerTitle && height > 50 && (
          <text x={(x + height / 2) + width} y={y + height + 15} textAnchor="middle" fill="#ffffff" transform={`rotate(-90, ${x + width / 2}, ${y + height + 10})`} fontSize="80%">
            {props?.innerTitle || ''}
          </text>
        )
      }
    </g>
  );
};

const CustomLegend = ({ values, title }: any) => (
  <div>

    <ul className="flex items-center justify-start gap-x-4">
      {
        values?.map((sub: string | { title: string; color: string }) => (
          <li key={typeof sub !== 'string' ? sub.title : sub} className="flex items-center gap-x-2">
            <p style={{ backgroundColor: typeof sub !== 'string' ? sub.color : getBarColor(sub) }} className="h-4 w-4 rounded-[4px]" />
            <p>{typeof sub !== 'string' ? sub.title : sub}</p>
          </li>
        ))
      }
    </ul>
  </div>
);
function BarChartType1(props: Props) {
  // eslint-disable-next-line no-shadow

  const renderBars = () => useMemo(() => {
    const a = props.data?.map((itm: any) => {
      const { name, ...rest } = itm;
      return Object.keys(rest)?.map((val: string) => val);
    });
    const b = a.flat();
    const c = Array.from(new Set(b));
    const bars = c?.map((val: any, index: number) => (
      <Bar
        key={val + index}
        dataKey={val}
        fill={props?.legend ? props?.legend[index]?.color : getBarColor(val)}
        shape={<CustomBar innerTitle={val} showInnerTitle={props?.innerTitle} />}
        barSize={16}
        background={{ fill: props?.shadow ? 'var(--linegray)' : 'transparent' }}
      />
    ));
    return [bars, c];
  }, [props.data, props?.legend, props?.shadow]);

  return (
    <div className={`p-4 bg-white border border-accent rounded-md ${props?.loading ? 'animate-pulse' : ''}`}>
      {
        props?.title && (
          <div className="flex flex-col items-center justify-center">
            <p className="font-semibold text-xl">
              {props.title}
            </p>
          </div>
        )
      }
      {
        props?.loading
          ? (
            <div className="h-full w-full grid place-items-center"><AloneLoader size={20} /></div>
          )
          : props.data.length < 1
            ? (
              <div className="h-full w-full grid place-items-center">No Data</div>
            )
            : (
              <div className="w-full h-full flex flex-col pl-12 relative">
                {
                  props?.verticalText && (
                    <p
                      className="-rotate-90 absolute top-1/2 transform -translate-x-2/3 -translate-y-1/2 font-semibold text-lg p-2 z-10"
                    >
                      {
                        props?.verticalText
                      }
                    </p>
                  )
                }
                <div className="h-[600px] mt-5">
                  <ResponsiveContainer width="100%">
                    <BarChart width={730} height={250} data={props.data}>
                      <XAxis dataKey={props?.xAxisKey} axisLine={false} tickLine={false} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        domain={[0, 100]}
                      />
                      {renderBars()?.[0]}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center">
                  <div>
                    {
                      props?.horizontalText && (
                        <div className="flex flex-col items-center justify-center">
                          <p className="font-semibold">{props?.horizontalText}</p>
                        </div>
                      )
                    }
                  </div>
                  {
                    props?.showLegend && (
                      <CustomLegend values={props?.legend || renderBars()?.[1]} />
                    )
                  }
                </div>
              </div>
            )
      }
    </div>
  );
}

export default React.memo(BarChartType1);
