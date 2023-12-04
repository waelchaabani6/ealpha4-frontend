import Loader from '@shared/loader';
import React, { useCallback, useEffect, useId, useState } from 'react';
import { ReactComponent as Edit } from '@images/longMenuIcons/Edit.svg';
import InfiniteScroll from 'react-infinite-scroll-component';
import Checkbox from '@component/checkbox';
import { FormControlLabel } from '@mui/material';

type Props = {
  data: any[];
  setCheckedData: (val: (string | number)[]) => void;
  checkedData: any[];
  fetchData: () => void;
  hasMore: boolean;
  length?: number;
  cusHeight?: string;
  editHandler?: (val: (string | number)[]) => void;
}

function LazyLoadingList(props: Props) {
  const { data, setCheckedData, checkedData, fetchData, hasMore, cusHeight, editHandler } = props;
  const scrollableTarget = useId();

  const onCheckboxSelect = useCallback((value: string | number) => {
    if (checkedData.includes(value)) {
      setCheckedData(checkedData.filter((ele: string | number) => ele !== value));
    } else {
      setCheckedData([...checkedData, value]);
    }
  }, [checkedData]);

  return (
    <div className={`${cusHeight} h-full w-full overflow-auto`} id={scrollableTarget}>
      <InfiniteScroll
        className=" flex flex-col"
        scrollableTarget={scrollableTarget}
        dataLength={props?.length ?? data.length} // This is important field to render the next data
        next={fetchData}
        hasMore={hasMore}
        loader={<Loader size={20} />}
        endMessage={data.length > 10 && !hasMore && (
          <p className="text-center">
            <i>No more data</i>
          </p>
        )}
      >
        {
          data?.map((item: any) => {
            const checked = checkedData.includes(item?.value);
            return (
              <div className="flex items-center justify-between">
                <FormControlLabel
                  key={item.id}
                  className="hover:bg-gray-100"
                  control={(
                    <Checkbox checked={checked} size="small" onChange={() => onCheckboxSelect(+item.value)} />
                  )}
                  label={<p className="text-sm font-semibold">{item.label}</p>}
                />
                {
                  editHandler
                    ? (
                      <span role="button" tabIndex={0} onClick={() => editHandler(item)}>
                        <Edit width="50px" height="20px" style={{ color: 'red' }} />
                      </span>
                    )
                    : null
                }
              </div>
            );
          })
        }
      </InfiniteScroll>
    </div>
  );
}

export default LazyLoadingList;
