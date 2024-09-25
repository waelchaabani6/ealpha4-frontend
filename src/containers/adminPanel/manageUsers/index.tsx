/* eslint-disable comma-dangle */
import { useEffect, useState } from 'react';

import RouteLayout from '@layout/routeLayout';
import { useGet } from '@shared/api/useApi';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';

import SearchUser from './SearchUser';
import SearchResults from './SearchResults';

export default function manageUsers() {
  const [searchString, setSearchVal] = useState('');
  const [searchData, setSearchData] = useState<any>([]);

  const { isFetching: LogListLoading, refetch: fetchUsers } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/user-search?username=${searchString}`,
    onSuccess: (res: any) => {
      //   const accData = res?.data?.response;
      //   const respData = accData?.results;
      //   setTotalDataCount(accData.count);
      //   setTableData(respData);
      setSearchData(res?.data?.response);
      console.log('test =', res?.data?.response);
    },
    onError: ({ response }: any) => {},
    enabled: false,
  });

  useEffect(() => {
    fetchUsers();
  }, [searchString]);

  return (
    <RouteLayout navBack={true}>
      <HeaderMenus title="Manage Users" />
      <div className="wrapperBorder mt-5 p-5">
        <p className="font-semibold">Manage Users</p>
        <SearchUser setSearchVal={setSearchVal} isLoading={false} />
        <SearchResults searchData={searchData} />
      </div>
    </RouteLayout>
  );
}
