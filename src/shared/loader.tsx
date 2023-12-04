import { CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { USER_TYPE } from '@constants/constants';
import UiAnimate from './animatedLayout/uiAnimate';

type LoaderProps = {
  size?: number;
}
Loader.defaultProps = {
  size: 40
};

export default function Loader(props: LoaderProps): JSX.Element {
  const userRole = useSelector((state: any) => state?.user?.role);

  return (
    <UiAnimate>
      {
        userRole?.name === USER_TYPE?.SUPER_ADMIN
          ? (

            <div className="h-full w-full grid place-items-center">
              <CircularProgress color="success" size={props.size} />
            </div>
          )
          : (
            <div className="grid place-items-center globalLoader">
              <CircularProgress color="success" size={props.size} />
            </div>
          )
      }
    </UiAnimate>
  );
}

export function AloneLoader(props: { size?: number }) {
  return (
    <CircularProgress color="success" size={props?.size || 20} />
  );
}
