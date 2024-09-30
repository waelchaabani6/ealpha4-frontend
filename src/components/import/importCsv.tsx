/* eslint-disable comma-dangle */
import Tabs from '@component/tab/Tabs';
import RouteLayout from '@layout/routeLayout';
import { useMemo, useState } from 'react';
import Import from './component/import';
import Imported from './component/imported';

export default function importCsv() {
  const [tab, setTab] = useState(0);

  const tabList = useMemo(
    () => [
      { title: 'Import CSV', component: <Import setTab={setTab} /> },
      { title: 'Imported CSV', component: <Imported /> },
    ],
    []
  );
  return (
    <RouteLayout>
      <div className="mt-6 h-full w-full flex flex-col">
        <Tabs
          tabs={tabList}
          transparent={!true}
          border={true}
          currentTab={tab}
        />
      </div>
    </RouteLayout>
  );
}
