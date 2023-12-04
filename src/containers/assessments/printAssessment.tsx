import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import RouteLayout from '../layout/routeLayout';

export default function PrintAssessment() {
  const navigate = useNavigate();
  const { aid } = useParams();
  const [searchParams] = useSearchParams();
  if (!aid) {
    navigate(-1);
  }
  const location = useLocation();
  const handleClick = (type: string) => {
    const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);
    navigate(`/${schoolNameInURL}/assessments/print-assessment/${aid}/question_answer?type=${type}`);
  };
  return (
    <RouteLayout>
      <HeaderMenus title={`${searchParams.get('name') || ''}`} />
      <div className="wrapperBorder w-full h-full grid grid-cols-1 md:grid-cols-2 gap-y-2 md:gap-x-6 p-4 mt-4">
        <div onClick={() => handleClick('question')} className="flex justify-center h-[34px] border border-accent rounded-[3px] text-accent p-1 cursor-pointer hover:bg-lime-600 hover:text-white">Questions Sheets for Printing</div>
        <div onClick={() => handleClick('answer')} className="cursor-pointer flex justify-center h-[34px] border border-accent rounded-[3px] text-accent p-1 hover:bg-lime-600 hover:text-white">Answers Sheets for Printing</div>
      </div>
    </RouteLayout>
  );
}
