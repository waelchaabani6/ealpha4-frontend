/* eslint-disable react/jsx-no-constructed-context-values */
import Tabs from '@component/tab/Tabs';
import RouteLayout from '@layout/routeLayout';
import { userRole } from '@utility/utility';
import React, { useMemo, useRef, useState } from 'react';

const SchoolForm = React.lazy(() => import('../forms/schoolForm'));
const BranchForm = React.lazy(() => import('../forms/branchForm'));
const IntegrationForm = React.lazy(() => import('../forms/integrationForm'));

type createContextDataType = {
  contextData: any;
  setContextData: (value: any) => void;
  nextTab: () => void;
  prevTab: () => void;
};

export const CreateContext = React.createContext<createContextDataType | null>(null);

export default function CreateNewSchool() {
  const tabRef = useRef<any>();
  const tabList = useMemo(() => {
    if (userRole().isSchoolAdmin) {
      return (
        [
          { title: 'Edit School', component: <SchoolForm context={CreateContext} isEdit={true} /> }
        ]
      );
    }
    return (
      [
        { title: 'Edit School', component: <SchoolForm context={CreateContext} isEdit={true} /> },
        { title: 'Create New Branch', component: <BranchForm context={CreateContext} /> },
        { title: 'Integrations', component: <IntegrationForm context={CreateContext} isEdit={true} isBranch={false} /> }
      ]
    );
  }, []);
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
