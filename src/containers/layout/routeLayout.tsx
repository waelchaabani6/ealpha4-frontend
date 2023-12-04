import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import BackIcon from '@images/angle-down.svg';
import UiAnimate from '@shared/animatedLayout/uiAnimate';

type RouteLayoutProps = {
  children: ReactNode;
  navBack?: boolean;
  overflow?: boolean;
  path?: string;
  state?: any;
}
RouteLayout.defaultProps = {
  navBack: true,
  overflow: false,
  state: {}
};
export default function RouteLayout(props: RouteLayoutProps) {
  const navigate = useNavigate();
  return (
    <UiAnimate overflow={props?.overflow}>
      <div className="w-full h-full flex flex-col">
        {props.navBack && (
          <div className="flex items-center ">
            <button
              type="button"
              className="flex items-center px-1 gap-x-1 cursor-pointer"
              onClick={() => (props?.path ? navigate(props?.path, { state: props?.state }) : navigate(-1))}
            >
              <img src={BackIcon} alt="" className="h-3" />
              <p className="text-sm">Back</p>

            </button>
          </div>
        )}

        {props.children}
      </div>
    </UiAnimate>
  );
}
