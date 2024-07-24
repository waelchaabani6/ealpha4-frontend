/* eslint-disable no-plusplus */
import RouteLayout from '@layout/routeLayout';
import { useEffect, useMemo, useState } from 'react';
import { ReactComponent as ManageAdmin } from '@images/smicons/manageAdminn1.svg';
import { ReactComponent as ManageMembers } from '@images/smicons/Ic_managemembers.svg';
import { ReactComponent as ManageAssignment } from '@images/smicons/Ic_manage-assignment.svg';
import { ReactComponent as EditSchool } from '@images/smicons/Ic_edit-school2.svg';
import { ReactComponent as ManageCourses } from '@images/smicons/manageCourcePermission.svg';
import { ReactComponent as RegionIcon } from '@images/smicons/Frame.svg';
import DatePicker from '@component/datepicker';
import { Link } from 'react-router-dom';
import Dropdown from '@component/dropdown/Dropdown';
import { useGet } from '@shared/api/useApi';
import Loader from '@shared/loader';
import moment from 'moment';
import ToastMessage from '@containers/dashboard/ToastMessage';
import RadialGraph from './radialGraph';
import BarChart from './barChart';
import Crousel from './crousel';

const fltr = ['Date', 'Week', 'Month', 'Year'];

function formatGraphData(grpData: any, dateFormat?: string) {
  const barLabel = grpData?.labels;
  const barData = grpData?.chartdata;
  const tmp = [] as any;
  for (let i = 0; i < barLabel.length; i++) {
    tmp.push({
      name: barLabel[i],
      dt: barData[i]
    });
  }
  const tmp2 = grpData?.pie_chart_data.map((itm: any, index: number) => ({ dt: itm, fill: index === 1 ? '#4A9D2D' : '#f72626' }));
  return {
    bar: tmp || [],
    chart: tmp2 || []
  };
}

export default function SuperAdminDashboard() {
  const [filter, setFilter] = useState<string>('Year');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedCountry, setCountry] = useState<string>('');
  const [chartData, setChartData] = useState<{ bar: any[]; chart: any[] }>({ bar: [], chart: [] });
  const [card2, setCard2] = useState<{ title: string; count: string }[] | any[]>([0, 0, 0, 0]);
  const cards = [
    {
      text: 'Add Admin',
      link: `/admin-panel/manage-admin`,
      img: <ManageAdmin />
    },
    {
      text: 'Add Region',
      link: `/manage-courses/add-course`,
      img: <RegionIcon />
    },
    {
      text: 'Create School',
      link: `/school-management/new-school`,
      img: <EditSchool />
    },
    {
      text: 'Manage Integration',
      link: `/integration`,
      img: <ManageMembers />
    },
    {
      text: 'Manage Courses',
      link: '/manage-courses',
      img: <ManageCourses />
    },
    {
      text: 'Manage Publisher',
      link: `/publisher/course-code`,
      img: <ManageAssignment />
    }
  ];
  const masterServiceBaseURL = import.meta.env.VITE_APP_MASTER_SERVICE_URL;
  const schoolServiceBaseURL = import.meta.env.VITE_APP_SCHOOL_SERVICE_URL;
  const { isLoading: initLoading, data: initialData } = useGet({
    baseURL: masterServiceBaseURL,
    url: 'master-service/super_admin/'
  });
  const cardList = cards?.map((itm: any) => (
    <div key={itm?.text} className="hover:scale-105 hover:shadow-xl cursor-pointer shadow-xl bg-white h-[128px] card1">
      <Link key={itm?.link} to={itm?.link}>
        <div className="w-[80px] h-[60px] dashboardSvg">
          {itm?.img}
        </div>
        <p className="text-center text-sm font-medium">{itm.text}</p>
      </Link>
    </div>
  ));
  const cardList2 = card2.map((itm: any, index: number) => (
    <div key={initLoading ? `card2-${index}` : itm?.title} className={`shadow-xl h-[112px] flex items-center justify-start rounded-2xl relative px-4 overflow-hidden ${initLoading ? 'bg-fishgray animate-pulse' : 'bg-accent'}`}>
      {
        !initLoading && (
          <>
            <div className="font-semibold text-white">
              <p className="text-left text-sm capitalize">{itm.title}</p>
              <p className="text-left text-lg capitalize">{itm.count}</p>
            </div>
            <div className="absolute w-[67px] h-[67px] rounded-full border border-white -bottom-[20px] -right-[20px]" />
          </>
        )
      }
    </div>
  ));

  const { data: countryData, isLoading: countryLoading } = useGet({
    baseURL: masterServiceBaseURL,
    url: 'master-service/country/'
  });
  const { isLoading: yearFilterLoading, data: yearFilterData, refetch: refetchYearFilter } = useGet({
    baseURL: schoolServiceBaseURL,
    url: `schools-service/schools/get-school-by-year/${selectedCountry}/?start_year=${moment(new Date(startDate)).format('yyyy')}&end_year=${moment(new Date(endDate)).format('yyyy')}`,
    enabled: false
  });
  const { isLoading: dateFilterLoading, data: dateFilterData, refetch: refetchDateFilter } = useGet({
    baseURL: schoolServiceBaseURL,
    url: `schools-service/schools/get-school-by-date/${selectedCountry}/?selected_date=${moment(new Date(startDate)).format('yyyy-MM-DD')}`,
    enabled: false
  });

  const { isLoading: monthFilterLoading, data: monthFilterData, refetch: refetchMonthFilter } = useGet({
    baseURL: schoolServiceBaseURL,
    url: `schools-service/schools/get-school-by-month/${selectedCountry}/?selected_month=${moment(new Date(startDate)).month() + 1}&selected_year=${moment(new Date(startDate)).format('yyyy')}`,
    enabled: false
  });
  const { isLoading: weekFilterLoading, data: weekFilterData, refetch: refetchWeekFilter } = useGet({
    baseURL: schoolServiceBaseURL,
    url: `schools-service/schools/get-school-by-week/${selectedCountry}/?start_date=${moment(new Date(startDate)).format('yyyy-MM-DD')}&end_date=${moment(new Date(endDate)).format('yyyy-MM-DD')}`,
    enabled: false
  });

  useEffect(() => {
    if (selectedCountry) {
      if (filter === 'Date') {
        refetchDateFilter();
      }
      if (filter === 'Week') {
        refetchWeekFilter();
      }
      if (filter === 'Month') {
        refetchMonthFilter();
      }
      if (filter === 'Year') {
        refetchYearFilter();
      }
    }
  }, [startDate, endDate, filter, selectedCountry]);

  useEffect(() => {
    if (initialData) {
      const tg = initialData.data.response;
      setCard2([
        { title: 'Total Schools', count: `${tg?.school_count}+` || '0' },
        { title: 'Total Branches', count: `${tg?.branch_count}+` || '0' },
        { title: 'Total Users', count: `${tg?.users_count}+` || '0' },
        { title: 'Total Regions', count: `${tg?.country_count}+` || '0' },
        { title: 'Total Courses', count: `${tg?.course_count}+` || '0' }
      ]);
    }
  }, [initialData]);

  useEffect(() => {
    if (yearFilterData) {
      setChartData(formatGraphData(yearFilterData.data.response));
    }
  }, [yearFilterData]);
  useEffect(() => {
    if (dateFilterData) {
      setChartData(formatGraphData(dateFilterData.data.response));
    }
  }, [dateFilterData]);
  useEffect(() => {
    if (monthFilterData) {
      setChartData(formatGraphData(monthFilterData.data.response, 'D'));
    }
  }, [monthFilterData]);
  useEffect(() => {
    if (weekFilterData) {
      setChartData(formatGraphData(weekFilterData.data.response, 'w'));
    }
  }, [weekFilterData]);

  const countryDataArray = useMemo(() => {
    if (countryData?.data?.results && Array.isArray(countryData?.data?.results)) {
      return countryData.data.results.map((item: any) => ({
        label: item.name,
        value: item.name
      }));
    }
    return [];
  }, [countryData]);

  const pickerView = useMemo(() => {
    switch (filter) {
      case 'Date':
        return ['day', 'DD-MM-YYYY'];
      case 'Month':
        return ['month', 'MM-YYYY'];
      case 'Year':
        return ['year', 'YYYY'];
      default:
        return ['day', 'DD-MM-YYYY'];
    }
  }, [filter]);

  const card1BreakPoints = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 6
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 6
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 3
    },
    tablet1: {
      breakpoint: { max: 1100, min: 464 },
      items: 3
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 2
    }
  };
  const card2BreakPoints = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 5
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 5
    },
    tablet: {
      breakpoint: { max: 1100, min: 464 },
      items: 3
    },
    tablet2: {
      breakpoint: { max: 850, min: 464 },
      items: 3
    },
    mobile: {
      breakpoint: { max: 700, min: 0 },
      items: 2
    }
  };
  return (
    <RouteLayout navBack={false} overflow={true}>
      <ToastMessage />
      <div className="h-32 w-full">
        <Crousel responsive={card1BreakPoints} uiArr={cardList} />
      </div>
      <div className="h-32 w-full mt-[30px]">
        <Crousel responsive={card2BreakPoints} uiArr={cardList2} />
      </div>
      <div className={`${initLoading ? 'mt-10' : 'mt-6'} flex md:justify-center lg:justify-end`}>
        <div className="w-full gap-y-4 sm:w-full lg:w-max grid sm:grid-cols-1 lg:grid-cols-4 items-end sm:gap-y-4 lg:gap-x-2">
          {
            filter === 'Month' && (
              <div />
            )
          }

          <Dropdown
            title="country"
            displayEmpty={true}
            value={selectedCountry}
            loading={countryLoading}
            dataArray={countryDataArray}
            onChangeHandler={(val: string) => setCountry(val)}
            sxClass={{ width: '100%' }}
          />

          <DatePicker
            disablePast={false}
            value={startDate}
            label={filter === 'Month' ? filter : `start ${filter}`}
            handlePickerChange={(date: Date) => setStartDate(date)}
            sxType={1}
            views={pickerView[0]}
            format={pickerView[1]}
            fullWidth={true}
            disableFuture={endDate}
            disableOld={'2022' as any}
          />
          {
            (filter !== 'Month' && filter !== 'Date') && (
              <DatePicker
                disablePast={false}
                value={endDate}
                label={`end ${filter}`}
                handlePickerChange={(date: Date) => setEndDate(date)}
                sxType={1}
                views={pickerView[0]}
                disableFuture={new Date()}
                format={pickerView[1]}
                fullWidth={true}
                disableOld={startDate}
              />
            )
          }
          <div className="flex items-center justify-center lg:mt-4 lg:justify-end gap-2">
            {
              fltr.map((itm: string, ind: number) => (
                <button
                  key={ind}
                  type="button"
                  className={`active:scale-95 hover:bg-gray-300 text-xs font-semibold ${filter === itm ? 'bg-accent text-white hover:bg-accent' : 'text-black'} rounded-3xl h-7 w-12`}
                  onClick={() => setFilter(itm)}
                >
                  {itm}
                </button>
              ))
            }
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-y-4 lg:gap-x-4 min-h-[339px]">
        <div className="bg-white rounded-md p-4">
          {
            (initLoading || yearFilterLoading || dateFilterLoading || monthFilterLoading || weekFilterLoading)
              ? <Loader />
              : (
                <>
                  <p className="font-semibold">Analysis Report</p>
                  <div className="min-h-[339px] grid grid-cols-1 pb-2 lg:pb-0 lg:grid-cols-2">
                    <RadialGraph data={chartData?.chart} />
                    <div className="grid place-items-center">
                      <div className="h-[216px] w-full lg:w-[194px] grid place-items-center rounded-md bg-green-100">
                        <div className="flex flex-col gap-y-4">
                          <p className="font-semibold">{`Total ${chartData?.chart[0]?.dt || 0} Schools`}</p>
                          <div className="flex items-center gap-x-2">
                            <div className="h-2 w-2 rounded-full bg-[#f72626]" />
                            <p className="text-sm">Registered School</p>
                          </div>
                          <div className="flex items-center gap-x-2">
                            <div className="h-2 w-2 rounded-full bg-[#4A9D2D]" />
                            <p className="text-sm">New School</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )
          }
        </div>
        <div className="bg-white rounded-md p-4 relative">
          {
            (initLoading || yearFilterLoading || dateFilterLoading || monthFilterLoading || weekFilterLoading)
              ? <Loader />
              : (
                <div className="h-[340px] flex flex-col justify-between pb-4 overflow-x-auto">
                  <p className="font-semibold mb-4">School Count</p>
                  <BarChart data={chartData?.bar || []} rotate={filter === 'Week' || filter === 'Month'} />
                </div>
              )
          }
        </div>
      </div>
    </RouteLayout>
  );
}
