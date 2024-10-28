import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import BackIcon from "@images/angle-down.svg";
import UiAnimate from "@shared/animatedLayout/uiAnimate";

type RouteLayoutProps = {
  children: ReactNode;
  navBack?: boolean;
  overflow?: boolean;
  path?: string;
  state?: any;
};
RouteLayout.defaultProps = {
  navBack: true,
  overflow: false,
  state: {},
};
export default function RouteLayout(props: RouteLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const handleBackClick = () => {
    const isSpecialPath = /^\/Creative%20School\/(?!course-preview$)[^/]+$/.test(location.pathname);
    if (isSpecialPath) {
      navigate("/dashboard");
    } else if (props.path) {
      navigate(props.path, { state: props.state });
    } else if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/", { replace: true }); // Default fallback
    }
  };
  return (
    <UiAnimate overflow={props?.overflow}>
      <div className="w-full h-full flex flex-col">
        {props.navBack && (
          <div className="flex items-center ">
            <button
              type="button"
              className="flex items-center px-1 gap-x-1 cursor-pointer"
              onClick={handleBackClick}
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
