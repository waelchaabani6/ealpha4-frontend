import { useEffect, useState } from 'react';
import RouteLayout from '@layout/routeLayout';
import PageTitle from '@shared/pageTitle';
import { AxiosResponse } from 'axios';
import { useGet } from '@shared/api/useApi';
import AddSelection from './addSelection';
import AddSubject from './addSubject';
import AddedList from './addedList';

type DT = { label: string; value: string | boolean | number };

export default function Index() {
  const [page, setPage] = useState<number>(1);
  const [selection, setSelection] = useState<string | null>(null);
  const [dataArray, setDataArray] = useState<DT[] | []>([]);
  const [shouldReset, setshouldReset] = useState(false);
  const { isLoading, isRefetching, data, refetch } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: 'course-code-service/courses/selection/'
  });
  const { isLoading: isLoading1, data: data1, refetch: fetchList } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/content/?ordering=-created_at&limit=30&offset=${(page - 1) * 30}${selection ? `&selection=${selection}` : ''}`,
    enabled: !!selection,
    cacheTime: 0,
    onSuccess: (res: AxiosResponse) => {
      const newArray = res?.data?.response?.results?.map((item: any) => ({ label: item.content, value: item.id }));
      setDataArray([...dataArray, ...newArray]);
    }
  });
  const deleteFromArray = (arr: (number | string)[]) => {
    setDataArray(dataArray.filter((item: DT) => !arr.includes(+item.value)));
  };
  const appendNewData = (obj: DT) => {
    setDataArray([obj, ...dataArray]);
  };
  useEffect(() => {
    setDataArray([]);
  }, [selection]);
  const dataArr = data?.data?.response?.results?.map((item: any) => ({ label: item.name, value: item.id })) || [];

  return (
    <RouteLayout>
      <div className="h-max w-full flex items-center py-4">
        <PageTitle title="Add Course Master" />
      </div>
      <div className="flex-1 overflow-auto border border-accent bg-white rounded-md p-8 grid grid-cols-1 gap-y-8 md:grid-cols-3 md:gap-x-8">
        <AddSelection
          dataArray={dataArr}
          updatelist={() => refetch()}
          shouldReset={shouldReset}
          setshouldReset={setshouldReset}
        />
        <AddSubject
          isLoading={isLoading || isRefetching}
          dataArray={dataArr}
          setSelection={setSelection}
          appendNewData={appendNewData}
          resetPage={() => setPage(1)}
          shouldReset={shouldReset}
          setshouldReset={setshouldReset}
        />
        <AddedList
          fetchList={fetchList}
          selection={selection}
          isLoading={isLoading1}
          dataArray={dataArray}
          hasMore={!!data1?.data?.response?.next}
          fetchMore={() => setPage((prev: number) => prev + 1)}
          deleteFromArray={deleteFromArray}
          length={data1?.data?.response?.count}
          selectionList={dataArr}
          setDataArray={setDataArray}
          shouldReset={shouldReset}
          setshouldReset={setshouldReset}
        />
      </div>
    </RouteLayout>
  );
}
