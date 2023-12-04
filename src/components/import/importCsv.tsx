import Tabs from '@component/tab/Tabs';
import RouteLayout from '@layout/routeLayout';
import { useMemo } from 'react';
import Import from './component/import';
import Imported from './component/imported';

export default function importCsv() {
  const tabList = useMemo(() => (
    [
      { title: 'Import CSV', component: <Import /> },
      { title: 'Imported CSV', component: <Imported /> }
    ]
  ), []);
  return (
    <RouteLayout>
      <div className="mt-6 h-full w-full flex flex-col">
        <Tabs tabs={tabList} transparent={!true} border={true} />
      </div>
    </RouteLayout>
  );
}
