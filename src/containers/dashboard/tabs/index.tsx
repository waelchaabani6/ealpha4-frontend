import Tabs from '@component/tab/Tabs';
import { useMemo } from 'react';

import DueSoon from './DueSoon';
import InCompleted from './InCompleted';

export type DashboardTabsDataType = { assignment: any[]; assessment: any[] };

type Props = {
  dueData: DashboardTabsDataType;
  inCompleteData: DashboardTabsDataType;
  selectedChild?: string;
  currentSelectedTab?: (selectedTab: string) => void;
}

export default function Index(props: Props) {
  const tabList = useMemo(() => (
    [
      { title: 'Due Soon', component: <DueSoon data={props.dueData} selectedChild={props?.selectedChild} /> },
      { title: 'InComplete', component: <InCompleted data={props.inCompleteData} selectedChild={props?.selectedChild} /> }
    ]
  ), [props]);

  return (
    <Tabs attop={false} tabs={tabList} transparent={!true} border={true} currentSelectedTab={props.currentSelectedTab} />
  );
}
