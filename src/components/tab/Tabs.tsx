/* eslint-disable indent */
import React, { Suspense, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Loader from '@shared/loader';

type tabType = {
  title: string;
  component?: React.ReactNode;
}

/**
 * component type should be lazily loaded component
 * <Tabs tabs={[{ title: 'One', component: <One name="TEST" /> }, { title: 'Two', component: <Two /> }]} />
 */

interface Props {
  tabs: tabType[];
  border?: boolean;
  transparent?: boolean;
  disableNext?: boolean | undefined;
  enableTab?: number[] | undefined;
  currentTab?: number | undefined;
  attop?: boolean;
  currentSelectedTab?: (selectedTab: string) => void;
}

const Tabs = React.forwardRef((props: Props, ref: any) => {
  const uid = uuidv4();
  const [currentTab, setCurrentTab] = useState<tabType>(props.tabs[0]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [visitedTabs, setVisitedTabs] = useState<number[]>([0]);

  useEffect(() => {
    if (props?.enableTab) {
      setVisitedTabs([...visitedTabs, ...props.enableTab]);
    }
  }, [props?.enableTab]);

  useEffect(() => {
    if (props?.currentTab) {
      setCurrentIndex(props.currentTab);
      setVisitedTabs([props.currentTab]);
      setCurrentTab(props.tabs[props.currentTab]);
    }
  }, [props?.currentTab]);

  useImperativeHandle(ref, () => ({
    nextTab(tabArray?: number[]) {
      if (currentIndex < props.tabs.length - 1) {
        if (tabArray && tabArray.length > 0) {
          setVisitedTabs(Array.from(new Set([...visitedTabs, currentIndex + 1, ...tabArray])));
        }
        setCurrentIndex(currentIndex + 1);
        setCurrentTab(props.tabs[currentIndex + 1]);
      }
    },
    prevTab() {
      if (currentIndex > 0) {
        setCurrentTab(props.tabs[currentIndex - 1]);
      }
    },
    gotoTab(targetIndex: number) {
      if (targetIndex > -1 && currentIndex !== targetIndex && targetIndex < props.tabs.length) {
        setCurrentIndex(targetIndex);
        setVisitedTabs([...visitedTabs, targetIndex]);
        setCurrentTab(props.tabs[targetIndex]);
      }
    }
  }));

  useLayoutEffect(() => {
    if (visitedTabs.length > 0 && !visitedTabs.includes(currentIndex)) {
      setVisitedTabs([...visitedTabs, currentIndex]);
    }
    if (props?.attop) {
      document.getElementById('app-top')?.scrollIntoView();
    }
  }, [currentIndex]);

  const isDisable = useCallback((index: number) => (
    index > 0 && !visitedTabs.includes(index) && props.disableNext
  ), [visitedTabs]);

  const renderTabs = props.tabs.map((tab: tabType, index: number) => (
    <div
      key={tab.title}
      role="presentation"
      data-name={tab.title}
      onClick={(ev) => {
        if (!isDisable(index)) {
          ev.stopPropagation();
          setCurrentTab(tab);
          setCurrentIndex(index);
          if (props.currentSelectedTab) {
            props.currentSelectedTab(tab.title);
          }
        }
      }}
      className={`w-[175px] h-[52px] text-sm grid place-items-center font-medium cursor-pointer
      ${!isDisable(index)
          ? (
            `${currentTab.title === tab.title
              ? 'bg-[#3aa22b] text-white'
              : 'bg-[#FAFAFA] border border-[#CCCCCC] text-black'}
        rounded-tr-lg rounded-tl-lg `
          )
          : 'bg-gray-300 text-gray-500 border border-gray-200 rounded-tr-lg rounded-tl-lg cursor-not-allowed'}
      `}
    >
      {tab.title}
    </div>
  ));

  // const renderTabs = useMemo(() => props.tabs.map((tab: tabType, index: number) => (
  //   <div
  //     key={tab.title}
  //     role="presentation"
  //     data-name={tab.title}
  //     onClick={(ev) => {
  //       if (!isDisable(index)) {
  //         ev.stopPropagation();
  //         setCurrentTab(tab);
  //         setCurrentIndex(index);
  //       }
  //     }}
  //     className={`w-[175px] h-[52px] text-sm grid place-items-center font-medium cursor-pointer
  // ${!isDisable(index)
  //         ? (
  //           `${currentTab.title === tab.title
  //             ? 'bg-[#3aa22b] text-white'
  //             : 'bg-[#FAFAFA] border border-[#CCCCCC] text-black'}
  //   rounded-tr-lg rounded-tl-lg `
  //         )
  //         : 'bg-gray-300 text-gray-500 border border-gray-200 rounded-tr-lg rounded-tl-lg cursor-not-allowed'}
  // `}
  //   >
  //     {tab.title}
  //   </div>
  // )), [currentTab, currentIndex, visitedTabs]);
  return (
    <div id={uid} className="w-full h-full overflow-hidden flex flex-col">
      <div className="flex">
        {renderTabs}
      </div>
      <div
        className={`
        flex-1 overflow-auto
        ${props.transparent ? 'bg-transparent' : 'bg-white'} 
        ${props.border ? 'border border-accent rounded-md' : ''} 
        relative -top-1`}
      >
        <Suspense fallback={<div className="h-full grid place-items-center"><Loader /></div>}>
          {currentTab.component}
        </Suspense>
      </div>
    </div>
  );
});

Tabs.defaultProps = {
  attop: true
};

export default React.memo(Tabs);
