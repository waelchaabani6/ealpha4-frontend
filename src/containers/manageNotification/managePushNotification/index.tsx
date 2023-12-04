import React, { useMemo, useState } from 'react';
import { COMPONENTS, RESULTS_PER_PAGE, TABLE_LABELS, USER_TYPE } from '@constants/constants';
import RouteLayout from '@layout/routeLayout';
import AddIcon from '@mui/icons-material/Add';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { useLocation, useNavigate } from 'react-router-dom';
import Wrapper from '@shared/wrapper/Wrapper';
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import { getNoOfPages } from '@utility/utility';
import { useGet } from '@shared/api/useApi';
import { useSelector } from 'react-redux';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { selectUser } from '@shared/store/userSlice';

export default function Index() {
  const [page, setPage] = useState(1);
  const { role } = useSelector(selectUser);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const noOfpages = getNoOfPages(totalDataCount, RESULTS_PER_PAGE?.[0]);
  const navigate = useNavigate();
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const { pathname } = useLocation();
  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };
  const TableColumns = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center'
    },
    {
      label: 'Roles',
      mapper: 'roles'
    },
    {
      label: 'Recurring On',
      mapper: `recurring_on`
    },
    {
      label: 'Repeating Every',
      mapper: `repeating_every`
    },
    {
      label: 'Start Date',
      mapper: `start_date`,
      format: 'DD-MM-YYYY'
    },
    {
      label: 'End Date',
      mapper: `end_date`,
      format: 'DD-MM-YYYY'
    }
  ];
  const ADMIN_TOOLBAR_MENU = [
    {
      title: 'Create',
      icon: <AddIcon />
    }
  ];
  const handleToolbarAction = (title: string) => {
    if (title === 'Create') {
      navigate(`${pathname}/create`);
    }
  };
  const actionHandler = (acdata: any, handlername: string) => {
    if (handlername === 'add') {
      // console.log('add');
    }
    if (handlername === 'delete') {
      // console.log('delete');
    }
    if (handlername === 'edit') {
      // console.log('edit');
    }
  };
  const url = () => {
    switch (role.name) {
      case USER_TYPE.SCHOOL_ADMIN:
        return `${schoolData && !branchData ? `&school_id=${schoolData?.id}` : `&school_id=${branchData?.school_data?.id}&branch_id=${branchData?.id}`}`;
      case USER_TYPE.BRANCH_ADMIN:
        return `&school_id=${branchData?.school_data?.id}&branch_id=${branchData?.id}`;
      default:
        return `${schoolData ? `&school_id=${schoolData?.id}` : ''}${branchData ? `&school_id=${branchData?.school_data?.id}&branch_id=${branchData?.id}` : ''}`;
    }
  };

  const { isLoading: listLoading, data: listData } = useGet({
    baseURL: import.meta.env.VITE_APP_NOTIFICATION_SERVICE_URL,
    url: `notification-service/list-push-notification/?limit=10&offset=${(page - 1) * 10}${url()}`,
    onSuccess: (res: any) => {
      setTotalDataCount(res?.data?.response?.count || 0);
    }
  });

  const tableList = useMemo(() => listData?.data?.response?.results?.map((itm: any) => ({
    roles: itm.roles,
    start_date: itm.start_date,
    end_date: itm.end_date,
    recurring_on: itm.recurring_on,
    repeating_every: itm.repeating_every
  })), [listData]);

  return (
    <RouteLayout navBack={schoolData || branchData} overflow={true}>
      <HeaderMenus
        title="Manage Push Notification"
        menuArray={ADMIN_TOOLBAR_MENU}
        handleToolbarAction={handleToolbarAction}
      />
      <div className="wrapperBorder mt-4">
        <Wrapper>
          <AdvanceTable
            maxHeight={580}
            tableData={tableList || []}
            headerRows={TableColumns}
            totalPages={noOfpages}
            paginateHandler={handlePagination}
            currentPage={page}
            rowsPerPage={RESULTS_PER_PAGE?.[0]}
            actionHandler={actionHandler}
            isLoading={listLoading}
            setPage={setPage}
          />
        </Wrapper>
      </div>
    </RouteLayout>
  );
}
