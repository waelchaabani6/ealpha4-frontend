import React, { useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import DropDownList from './dropDownList';

type ChildType = { label: string; path: string };
type Props = {
  path: string;
  title: string;
  childs?: ChildType[];
  dropdown?: boolean;
  notificationCount?: number;
}

export default function TopBarLinks(props: Props) {
  const ref = useRef<{ left: number; top: number; width: number }>({ left: 0, top: 0, width: 0 });
  const [open, setopen] = useState<boolean>(false);
  const mouseEnterHandler = (event: React.MouseEvent<HTMLDivElement>) => {
    setopen(true);
    const styles = event.currentTarget.getBoundingClientRect();
    ref.current = {
      top: styles.top,
      left: styles.left,
      width: styles.width
    };
  };
  const mouseLeaveHandler = () => setopen(false);
  return (
    <div
      className="h-full relative"
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
    >
      {/* <div className="absolute top-4 -right-1 h-5 w-5 bg-sunlight rounded-full grid place-items-center text-[10px] text-white font-semibold">
        10+
      </div> */}
      <NavLink
        role="row"
        to={props.path}
        className={({ isActive }) => `inset-0 h-full w-max grid place-items-center px-4 border-0 ${isActive ? 'border-b-2 border-accent pt-[2px]' : ''}`}
      >
        <p className="pt-2 text-sm uppercase text-center">
          {props.title}
          {' '}
          {props?.notificationCount && (
            <span className="bg-sunlight text-white relative navCounter">
              {' '}
              {props?.notificationCount}
              {' '}
            </span>)}
        </p>
      </NavLink>
      {
        (ref?.current && props?.dropdown) && <DropDownList open={open} childs={props?.childs} ref={ref} />
      }
    </div>
  );
}
