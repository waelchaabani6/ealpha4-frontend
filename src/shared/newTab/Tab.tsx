import Global from '@containers/adminPanel/components/Global';
import Region from '@containers/adminPanel/components/Region';
import React, {
  Suspense,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import Loader from '../loader';

type tabType = {
  title: string;
};
interface Props {
  tabs: tabType[];
  border?: boolean;
  transparent?: boolean;
  searchString?: string;
  currentPage: number;
  rowsPerPage: number;
  curTotalPages: number;
  noOfpages: number;
  setCurTotalPages: (e?: any) => void;
  paginateHandler: (e?: any) => void;
  setRowsPerPage?: any;
  setPage?: any;
  triggerExport?: boolean;
  setTriggerExport?: any;
  handleEditPopup: (e?: any) => void;
  setAdminCsvData?: any;
  editMode?: boolean;
  setSelectedRegion?: any;
}

const Tabs = React.forwardRef((props: Props, ref: any) => {
  // const disableNext = true;
  const [currentTab, setCurrentTab] = useState<tabType>(props.tabs[0]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    props?.setSelectedRegion(props.tabs[0]);
  }, []);

  const renderTabs = useMemo(
    () =>
      props.tabs.map((tab: tabType, index: number) => (
        <div
          key={tab.title}
          role="presentation"
          data-name={tab.title}
          onClick={(ev) => {
            if (props?.setRowsPerPage) {
              props?.setRowsPerPage(10);
              props?.setPage(1);
            }
            ev.stopPropagation();
            setCurrentTab(tab);
            props?.setSelectedRegion(tab);
            setCurrentIndex(index);
            props.paginateHandler(1);
          }}
          className={`min-w-[100px] h-[52px] overflow-x-auto px-4
      ${currentTab.title === tab.title ? 'bg-accent text-white' : 'bg-[#FAFAFA] border border-[#CCCCCC] text-black'}
      rounded-tr-lg rounded-tl-lg text-sm grid place-items-center font-medium cursor-pointer`}
        >
          {tab.title}
        </div>
      )),
    [currentTab, currentIndex]
  );

  const tabProps = {
    searchString: props.searchString,
    setCurTotalPages: props.setCurTotalPages,
    setPage: props.paginateHandler,
    page: props.currentPage,
    rowsPerPage: props.rowsPerPage,
    curTotalPages: props.curTotalPages,
    noOfpages: props.noOfpages,
    triggerExport: props?.triggerExport,
    setTriggerExport: props?.setTriggerExport,
    handleEditPopup: props?.handleEditPopup,
    setAdminCsvData: props?.setAdminCsvData,
    editMode: props?.editMode,
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex">{renderTabs}</div>
      <div
        className={`
        flex-1
        ${props.transparent ? 'bg-transparent' : 'bg-white'}
        ${props.border ? 'border border-accent rounded-md' : ''}
        relative -top-1`}
      >
        <div ref={ref}>
          <Suspense
            fallback={
              <div className="h-[200px] grid place-items-center">
                <Loader />
              </div>
            }
          >
            {currentTab.title === 'Global' && <Global {...tabProps} />}
            {currentTab.title === 'Region' && <Region {...tabProps} />}
          </Suspense>
        </div>
      </div>
    </div>
  );
});

export default Tabs;
