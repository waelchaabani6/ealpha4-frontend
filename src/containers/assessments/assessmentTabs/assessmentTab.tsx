import Loader from '@shared/loader';
import React, { Suspense, useImperativeHandle, useMemo, useState } from 'react';

type tabType = {
  title: string;
}
interface Props {
  tabs: tabType[];
  paginateHandler: (e?: any) => void;
  handleTabClick?: (e?: any) => void;
  selectedTab?: string | any;
}

const AssessmentTabs = React.forwardRef((props: Props, ref: any) => {
  const { handleTabClick, tabs, paginateHandler, selectedTab } = props;
  const seletctedtabIndex = tabs?.findIndex((i: any) => i?.title === selectedTab);
  const [currentTab, setCurrentTab] = useState<tabType>(props.tabs[seletctedtabIndex] || props.tabs[0]);
  const [currentIndex, setCurrentIndex] = useState<number>(seletctedtabIndex > 0 ? seletctedtabIndex : 0);

  const renderTabs = useMemo(() => props.tabs.map((tab: tabType, index: number) => (
    <div
      key={tab.title}
      role="presentation"
      data-name={tab.title}
      onClick={(ev) => {
        ev.stopPropagation();
        setCurrentTab(tab);
        if (handleTabClick) {
          handleTabClick(tab);
        }
        setCurrentIndex(index);
        if (paginateHandler) {
          paginateHandler(1);
        }
      }}
      className={`globalTab
      ${currentTab.title === tab.title ? 'globalTabSelected' : ''} `}
    >
      {tab.title}
    </div>
  )), [currentTab, currentIndex]);

  const renderTabContent = () => {
    let content = null;
    tabs.map((i: any) => {
      if (currentTab.title === i?.title) {
        content = i?.component;
      }
      return true;
    }
    );
    return content;
  };

  return (
    <div className="w-full h-full overflow-hidden flex flex-col">
      <div className="flex">
        {renderTabs}
      </div>
      <div
        className={`
        flex-1 overflow-auto
        bg-white
        relative -top-1`}
      >
        <Suspense fallback={<div className="h-[200px] grid place-items-center"><Loader /></div>}>
          <div ref={ref}>
            {renderTabContent()}
          </div>
        </Suspense>
      </div>
    </div>
  );
});

export default AssessmentTabs;
