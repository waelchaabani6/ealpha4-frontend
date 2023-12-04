/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useMemo, useRef, useState } from 'react';
import Tabs from '@component/tab/Tabs';
import RouteLayout from '@layout/routeLayout';

const SchoolForm = React.lazy(() => import('../forms/schoolForm'));
const BranchForm = React.lazy(() => import('../forms/branchForm'));
const IntegrationForm = React.lazy(() => import('../forms/integrationForm'));

type createContextDataType = {
  contextData: any;
  setContextData: (value: any) => void;
  nextTab: (tabArray?: number[]) => void;
  prevTab: () => void;
};

export const CreateContext = React.createContext<createContextDataType | null>(null);

export default function CreateNewSchool() {
  const tabRef = useRef<any>();
  const tabList = useMemo(() => (
    [
      { title: 'Create New School', component: <SchoolForm context={CreateContext} /> },
      { title: 'Create New Branch', component: <BranchForm context={CreateContext} /> },
      { title: 'Integrations', component: <IntegrationForm context={CreateContext} isEdit={false} isBranch={false} /> }
    ]
  ), []);
  const [contextData, setContextData] = useState<any>();
  return (
    <div className="mt-2">
      <RouteLayout navBack={true}>
        <div className="mt-4">
          <CreateContext.Provider value={{
            contextData,
            setContextData,
            nextTab: (tabArray?: number[]) => tabRef.current?.nextTab(tabArray),
            prevTab: () => tabRef.current?.prevTab()
          }}
          >
            <Tabs tabs={tabList} disableNext={true} ref={tabRef} />
          </CreateContext.Provider>
        </div>
      </RouteLayout>
    </div>
  );
}
