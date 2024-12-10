/* eslint-disable linebreak-style */
/* eslint-disable no-unused-expressions */
/* eslint-disable comma-dangle */
import { useEffect, useState } from 'react';

import RouteLayout from '@layout/routeLayout';
import { useGet } from '@shared/api/useApi';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { USER_ROLE_LIST_LABEL } from '@constants/constants';

import SearchUser from './SearchUser';
import SearchResults from './SearchResults';

export default function manageUsers() {
  const [searchString, setSearchVal] = useState('');
  const [searchData, setSearchData] = useState<any>([]);

  const [rowsPerPage, setRowsPerPage] = useState(10 as number | 'All');
  const [page, setPage] = useState(1);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [order, setOrder] = useState<any>('asc');
  const [orderBy, setOrderBy] = useState<any>('username');

  const formatOrderBy = (orderString: string) => {
    if (orderString === 'user_name') {
      return 'username';
    }
    if (orderString === 'first_name') {
      return 'firstname';
    }
    if (orderString === 'last_name') {
      return 'lastname';
    }
    if (orderString === 'school_name') {
      return 'schoolname';
    }
    if (orderString === 'role_name') {
      return 'role';
    }
    return '';
  };

  const formattedOrderby = formatOrderBy(orderBy);
  const ordering = order === 'asc' ? formattedOrderby : `-${formattedOrderby}`;

  const { isFetching: LogListLoading, refetch: fetchUsers } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/user-search?search_in=${searchString}&limit=${
      rowsPerPage === 'All' ? 'All' : rowsPerPage
    }&offset=${rowsPerPage === 'All' ? 0 : (page - 1) * rowsPerPage}&ordering=${ordering}`,
    onSuccess: (res: any) => {
      const respData = res?.data?.results;
      setTotalDataCount(res?.data?.count);

      const body: any = [];

      if (respData?.length) {
        respData?.map((item1: any) => {
          body.push({
            user_name: item1?.user_name,
            first_name: item1?.profile?.first_name,
            id: item1?.profile?.id,
            last_name: item1?.profile?.last_name,
            role_id: item1?.role_id,
            role_name: USER_ROLE_LIST_LABEL.find(
              (obj: any) => obj.id === item1.role_id
            ).label,
            school_name: item1?.school_name,
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
  }, [page, rowsPerPage, orderBy, order]);

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
          setPage={setPage}
        />

        <SearchResults
          setPage={setPage}
          searchData={searchData}
          setRowsPerPage={setRowsPerPage}
          rowsPerPage={rowsPerPage}
          totalDataCount={totalDataCount}
          page={page}
          LogListLoading={LogListLoading}
          setOrderBy={setOrderBy}
          setOrder={setOrder}
          order={order}
          orderBy={orderBy}
        />
      </div>
    </RouteLayout>
  );
}
