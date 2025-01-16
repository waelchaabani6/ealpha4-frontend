/* eslint-disable no-lone-blocks */
import {
  DatePicker as MuiDatePicker,
  LocalizationProvider,
  StaticDatePicker,
} from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import TextField from '@mui/material/TextField';

import './CustomeCalendar.css';

function CustomCalendar({
  events,
  parentClass,
  value,
  onSelect,
}: CustomCalendarProps) {
  const [date, setDate] = useState(new Date());
  useEffect(() => {
    if (value) {
      setDate(moment(value).toDate());
    }
  }, [value]);
  useEffect(() => {
    const Sunday = document.querySelector('[aria-label="Sunday"]');
    const Monday = document.querySelector('[aria-label="Monday"]');
    const Tuesday = document.querySelector('[aria-label="Tuesday"]');
    const Wednesday = document.querySelector('[aria-label="Wednesday"]');
    const Thursday = document.querySelector('[aria-label="Thursday"]');
    const Friday = document.querySelector('[aria-label="Friday"]');
    const Saturday = document.querySelector('[aria-label="Saturday"]');
    if (
      Sunday != null &&
      Monday != null &&
      Tuesday != null &&
      Wednesday != null &&
      Thursday != null &&
      Friday != null &&
      Saturday != null
    ) {
      Sunday.textContent = 'Sun';
      Monday.textContent = 'Mon';
      Tuesday.textContent = 'Tue';
      Wednesday.textContent = 'Wed';
      Thursday.textContent = 'Thu';
      Friday.textContent = 'Fri';
      Saturday.textContent = 'Sat';
    }
  }, []);

  const dateSelectHandler = (dt: Date | null) => {
    if (dt) {
      const tmp = moment(dt).toDate();
      setDate(tmp);
      onSelect?.(tmp);
    }
  };

  const renderDayInPicker = (dt: any, _: any, dayInCurrentMonth: any) => {
    const isSunday = moment(dt).day() === 0;
    const isCurrent =
      moment(date).format('yyyy-DD-MM') === moment(dt).format('yyyy-DD-MM');
    const trigger = events && Object.keys(events)?.length > 0;
    let isEvent = {
      status: false,
      eventName: '',
    };
    if (trigger) {
      const eventExists = Object.keys(events)?.find(
        (a: string) =>
          moment(dt).format('yyyy-DD-MM') === moment(a).format('yyyy-DD-MM')
      );
      if (eventExists) {
        isEvent = {
          status: true,
          eventName: (events as any)[eventExists][0].name,
        };
      }
    }
    return (
      <div
        key={dt}
        role="presentation"
        className={`${trigger && isEvent.status ? `after:w-[5px] after:h-[5px] after:rounded-full relative top-[3.5px] after:bg-[#1B82EC]` : ''} w-full h-[27px] grid place-items-center ${!dayInCurrentMonth.outsideCurrentMonth ? (isCurrent ? 'text-black font-semibold' : isSunday ? 'text-gray-400' : 'text-black') : 'text-gray-300'} hover:cursor-pointer hover:scale-105 hover:text-gray-500`}
        onClick={() => dateSelectHandler(dt)}
      >
        {moment(dt).format('D')}
      </div>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <div className="relative h-[289px] w-fit">
        <StaticDatePicker<Date>
          renderDay={renderDayInPicker as any}
          orientation="portrait"
          openTo="day"
          value={date}
          onChange={dateSelectHandler}
          componentsProps={{
            actionBar: {
              actions: ['today'],
            },
          }}
          showDaysOutsideCurrentMonth={true}
          className={`CustomCalendar ${parentClass}`}
          renderInput={(params) => <TextField {...params} />}
        />
      </div>
    </LocalizationProvider>
  );
}

export default CustomCalendar;

type CustomCalendarProps = {
  parentClass?: string;
  onSelect?: (value: Date) => void;
  value?: string | Date;
  events?: { name: string; date: Date }[];
};

CustomCalendar.defaultProps = {
  parentClass: '',
};
