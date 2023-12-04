import { useEffect, useState } from 'react';
import moment from 'moment';
import Button from '@component/button/button';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DatePicker from '@component/datepicker';

type CustomeDateRangeProps = {
  parentClass: string;
  fromValProps: (arg0: string) => void;
  toValProps: (arg0: string) => void;
  fromInitialDate: Date;
  toInitialDate: Date;
  onSearchButtonClick: () => void;
  resetDateRange?: () => void;
}

function CustomeDateRange({ parentClass, fromValProps, toValProps, fromInitialDate, toInitialDate, onSearchButtonClick, resetDateRange }: CustomeDateRangeProps) {
  const [fromDate, setFromDate] = useState<any>('');
  const [toDate, setToDate] = useState<any>('');
  useEffect(() => {
    if (fromDate) {
      const tmp = moment(fromDate).format('YYYY-MM-DD');
      fromValProps(tmp);
    }
  }, [fromDate]);
  useEffect(() => {
    if (toDate) {
      const tmp = moment(toDate).format('YYYY-MM-DD');
      toValProps(tmp);
    }
  }, [toDate]);

  const onSearchButtonClickCustome = () => {
    if (fromDate || toDate) {
      onSearchButtonClick();
    }
  };

  const reset = () => {
    setFromDate('');
    setToDate('');
    if (resetDateRange) {
      resetDateRange();
    }
  };

  return (
    <div className={`flex items-center gap-x-4 ${parentClass}`}>
      <div>
        <DatePicker
          value={fromDate}
          label="Date From"
          handlePickerChange={(val: any) => setFromDate(val)}
          sxType={1}
          format="DD-MM-YYYY"
          disablePast={false}
          disableFuture={toDate}
          noFontSize={true}
        />
      </div>
      <div className="flex">
        <DatePicker
          value={toDate}
          label="Date To"
          handlePickerChange={(val: any) => setToDate(val)}
          sxType={1}
          format="DD-MM-YYYY"
          disablePast={false}
          disableOld={fromDate}
          noFontSize={true}
        />
        <div className="relative top-[37px] left-[14px]">
          {(fromDate || toDate) ? (
            <span tabIndex={0} title="Clear dates" onClick={() => reset()} role="button">
              <RestartAltIcon />
            </span>)
            : null}
        </div>
      </div>
      <div className="self-end">
        <Button
          onClick={onSearchButtonClickCustome}
        >
          Search
        </Button>
      </div>
    </div>
  );
}

export default CustomeDateRange;
