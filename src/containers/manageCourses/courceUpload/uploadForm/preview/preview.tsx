import RouteLayout from '@layout/routeLayout';
import '../../../../schoolManagement/style.css';
import { useLocation } from 'react-router-dom';
import Precard from './Precard';

export default function Preview() {
  const { state: locationState } = useLocation();

  return (
    <>
      <RouteLayout navBack={true}>
        <div className="h-9 mt-4 flex items-center sm:text-lg text-sm font-semibold border-l-4 border-sunlight pl-2 grow">Preview</div>
        <div className="mt-8 w-full h-full border border-accent rounded-md p-6 overflow-auto bg-white">
          <div className="flex flex-row justify-start gap-16">
            <Precard ImgRes={locationState} />
          </div>
        </div>
      </RouteLayout>
    </>
  );
}
