import { ReactElement } from 'react';
import './Donut.css';

const rotateAngle = 0;
const SIZE = 34;
const PREFIX = 'donut';
const halfSize = SIZE / 2;
const circleProps = {
  cx: halfSize,
  cy: halfSize,
  r: halfSize - 1
};

const getClassName = (p: string, c: string) => `${p}${c}`;
const renderProgress = (progress: number) => (
  <strong>
    {' '}
    {(progress)}
    {' '}
    %
  </strong>);

const Donut = ({
  progress = 0,
  onRender = renderProgress,
  prefix = PREFIX,
  color = '#000'
}) => (
  <div className={getClassName(prefix, progress < 0 ? ' is--negative' : '')}>

    <svg
      className={getClassName(prefix, '__canvas')}
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      xmlns="http://www.w3.org/2000/svg"
    >

      <defs>
        {/* <radialGradient id="g">
                    <stop stop-color="#00f" offset="0.1" />
                    <stop stop-color="rgba(0,0,255, 0.5)" offset="0.8" />
                </radialGradient> */}
        <filter id="sofGlow" width="300%" height="300%" x="-100%" y="-100%">
          <feGaussianBlur in="thicken" stdDeviation="1" result="blurred" />
        </filter>

      </defs>

      {/* <filter id="sofGlow" height="300%" width="300%" x="-75%" y="-75%"></filter> */}
      <circle
        className={getClassName(prefix, '__frame')}
        cx={17}
        cy={17}
        r={16}
        stroke={color}
      />

      <circle
        className={getClassName(prefix, '__circle')}
        stroke={color}
        strokeDasharray={`${Math.abs(progress)} 100`}
        cx={17}
        cy={17}
        r={14}
        fill="url(#g)"
        filter="url(#sofGlow)"
      />
    </svg>

    {typeof onRender === 'function' && (
      <div className={getClassName(prefix, '__text')}>
        {onRender(progress)}
      </div>
    )}
  </div>
);

export default Donut;
