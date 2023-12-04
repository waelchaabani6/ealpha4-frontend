/* eslint-disable react/jsx-no-constructed-context-values */
import Tabs from '@component/tab/Tabs';
import RouteLayout from '@layout/routeLayout';
import React, { useMemo, useRef, useState } from 'react';

type ContextData = {
  schoolData: any;
  branchData: any;
}

const BranchForm = React.lazy(() => import('../../forms/branchForm'));
const IntegrationForm = React.lazy(() => import('../../forms/integrationForm'));

type CreateContextDataType = {
  contextData: ContextData;
  setContextData: (value: any) => void;
  nextTab: () => void;
  prevTab: () => void;
};

export const CreateContext = React.createContext<CreateContextDataType | null>(null);

export default function CreateNewSchool() {
  const tabRef = useRef<any>();
  const tabList = useMemo(() => (
    [
      { title: 'Create Branch', component: <BranchForm context={CreateContext} /> },
      { title: 'Integrations', component: <IntegrationForm context={CreateContext} isEdit={false} isBranch={true} /> }
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
            nextTab: () => tabRef.current?.nextTab(),
            prevTab: () => tabRef.current?.prevTab()
          }}
          >
            <Tabs tabs={tabList} ref={tabRef} />
          </CreateContext.Provider>
        </div>
      </RouteLayout>
    </div>
  );
}
