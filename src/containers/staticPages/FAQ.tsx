import RouteLayout from '@layout/routeLayout';
import React from 'react';
import { useGet } from '@shared/api/useApi';
import StaticHeader from './staticHeader';

export default function FAQ() {
  const { isLoading: pageLoading, data: pageContent } = useGet({
    baseURL: import.meta.env.VITE_APP_CMS_SERVICE_URL,
    url: `cms-service/page/1/`
  });
  return (
    <RouteLayout navBack={false}>
      <StaticHeader />
      {/* <h2 className="text-3xl my-4 mt-28 pl-5">FAQ</h2> */}
      {/* eslint-disable-next-line react/no-danger */}
      <div className="mt-24" dangerouslySetInnerHTML={{ __html: pageContent?.data?.response?.content }} />
      {/* <div className="h-full w-full grid place-items-center pt-[15%] text-xl animate-pulse">Coming Soon...</div> */}
    </RouteLayout>
  );
}
