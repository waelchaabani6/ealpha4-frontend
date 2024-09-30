/* eslint-disable no-unused-expressions */
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

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [totalDataCount, setTotalDataCount] = useState(0);

  const { isFetching: LogListLoading, refetch: fetchUsers } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/user-search?username=${searchString}&limit=${rowsPerPage}&offset=${(page - 1) * rowsPerPage}`,
    onSuccess: (res: any) => {
      const respData = res?.data?.results;
      setTotalDataCount(res?.data?.count);

      const body: any = [];
      if (respData?.length) {
        respData.map((item1: any) => {
          body.push({
            user_name: item1?.user_name,
            first_name: item1?.profile.first_name,
            id: item1?.profile.id,
            last_name: item1?.profile.last_name,
            role_id: item1?.role_id,
          });
          return body;
        });
      }
      setSearchData(body);
    },
    onError: ({ response }: any) => {},
    enabled: false,
  });

  useEffect(() => {
    searchData?.length && fetchUsers();
  }, [page, rowsPerPage]);

  return (
    <RouteLayout navBack={true}>
      <HeaderMenus title="Manage Users" />
      <div className="wrapperBorder mt-5 p-5">
        <p className="font-semibold">Manage Users</p>
        <SearchUser
          setSearchVal={setSearchVal}
          searchVal={searchString}
          isLoading={false}
          fetchData={fetchUsers}
        />

        <SearchResults
          setPage={setPage}
          searchData={searchData}
          setRowsPerPage={setRowsPerPage}
          rowsPerPage={rowsPerPage}
          totalDataCount={totalDataCount}
          page={page}
          LogListLoading={LogListLoading}
        />
      </div>
    </RouteLayout>
  );
}
