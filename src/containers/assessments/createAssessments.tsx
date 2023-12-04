import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { CustomInput } from '@component/input';
import { useSearchParams } from 'react-router-dom';
import Button, { IconButton } from '@component/button/button';
import { ReactComponent as PenIcon } from '@images/pen.svg';
import { ReactComponent as Eye } from '@images/eye.svg';
import { useRef, useState } from 'react';
import RouteLayout from '../layout/routeLayout';
import AssessmentTabs from './assessmentTabs/assessmentTab';
import Questions from './assessmentTabs/questions';

export default function CreateAssessments() {
  const componentRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [question, setQuestion] = useState('');
  const QUESTIONS = 'Questions';
  const PLAYER = 'Player';
  const DETAILS = 'Details';
  const TAGS = 'Tags';
  const SOURCE = 'Source';

  const [selectedTab, setSelectedTab] = useState<any>(searchParams.get('tabType') || QUESTIONS);
  const [page, setPage] = useState(1);
  let tabProps: any = {};
  // -----------------------API---------------------------------
  tabProps = {
    ...tabProps
  };
  const handleSave = () => {

  };
  const handleTabClick = (tabDetail: any) => {
    setSearchParams({ tabType: tabDetail?.title });
    setSelectedTab(tabDetail?.title);
  };
  const tabList = [
    { title: QUESTIONS, component: <Questions {...tabProps} /> },
    { title: PLAYER, component: <Questions {...tabProps} /> },
    { title: DETAILS, component: <Questions {...tabProps} /> },
    { title: TAGS, component: <Questions {...tabProps} /> },
    { title: SOURCE, component: <Questions {...tabProps} /> }
  ];
  return (
    <RouteLayout>
      <HeaderMenus title="Create Assessments" />
      <div className="flex justify-between mt-4 mb-4">
        <div className="flex w-[80%]">
          <CustomInput label="Please add questions to your Assessment: 34" name="add_question" size="small" sx={{ backgroundColor: 'var(--white)' }} onChange={(e: any) => setQuestion(e.target.value)} />
          <div className="mt-[35px] ml-4 text-end">
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
        <div className="mt-[35px]">
          <IconButton sx={{ marginRight: '8px' }}>
            <PenIcon />
          </IconButton>
          <IconButton>
            <Eye />
          </IconButton>
        </div>
      </div>
      <AssessmentTabs
        ref={componentRef}
        handleTabClick={handleTabClick}
        tabs={tabList}
        paginateHandler={setPage}
        selectedTab={searchParams.get('tabType') || selectedTab}
      />
    </RouteLayout>
  );
}
