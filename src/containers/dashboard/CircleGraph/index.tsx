import { useEffect, useState } from 'react';
import Dropdown from '@component/dropdown/Dropdown';
import Donut from '../../../components/Donut/index';

type dropdownType = {
  loading: boolean;
  onSelect: (e: any) => void;
  value: string | number;
  dataArray: ({ label: string; value: string } | string | number | any)[];
}

type CircleGraphProps = {
  parentClass?: string;
  progress: number;
  color: string;
  title?: string;
  total?: number;
  dropdown: dropdownType;
  loading?: boolean;
}

function CircleGraph({ loading, dropdown, total, title, parentClass, progress, color }: CircleGraphProps) {
  const [selectData, setSelectData] = useState<number | string>();
  const handleStatus = (e: any) => {
    setSelectData(e);
  };

  return (
    <div className={`${parentClass} rounded-lg py-4 ${loading ? 'animate-pulse' : ''}`}>
      <div className="flex flex-row flex-wrap h-full">
        <div className="grow pl-4 pt-4">
          {
            title && (
              <div className="font-bold">
                {title}
              </div>
            )
          }
          {
            dropdown.value && (
              <div>
                <Dropdown
                  loading={dropdown.loading}
                  title=""
                  value={dropdown.value}
                  dataArray={dropdown.dataArray}
                  parentStyle="w-full"
                  onChangeHandler={dropdown.onSelect}
                />
              </div>
            )
          }
          <div className="mt-5">
            {`Total: ${total || 0}`}
          </div>
        </div>
        <div className="grow flex justify-center items-center">
          <Donut progress={progress} color={color} />
        </div>
      </div>
    </div>
  );
}

export default CircleGraph;
