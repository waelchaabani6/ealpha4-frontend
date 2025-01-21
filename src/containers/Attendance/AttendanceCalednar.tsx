/* eslint-disable linebreak-style */
import CustomDatePicker from "@component/CustomDatePicker";
import moment from "moment";
import { useMemo } from "react";

const AttendanceCalednar = ({ eventData, selectedDate, setSelectedDate }) => {
  const markEvents = useMemo(() => {
    const tmp = [] as any;
    const tmp2 = {} as any;
    eventData?.data?.response?.forEach((evt: any) => {
      const start = moment(evt.start_date);
      const end = moment(evt.end_date);
      while (start.format("yyyy-MM-DD") < end.format("yyyy-MM-DD")) {
        tmp.push(moment(start).format("yyyy-MM-DD"));
        const key = moment(start).format("yyyy-MM-DD");
        if (tmp2[key]) {
          tmp2[key] = [...tmp2[key], { name: evt?.event_name, date: start }];
        } else {
          tmp2[key] = [{ name: evt?.event_name, date: start }];
        }
        start.add(1, "days");
      }
      if (!tmp?.includes(moment(start).format("yyyy-MM-DD"))) {
        tmp.push(moment(start).format("yyyy-MM-DD"));
      }
      const key = moment(start).format("yyyy-MM-DD");
      if (tmp2[key]) {
        tmp2[key] = [...tmp2[key], { name: evt?.event_name, date: start }];
      } else {
        tmp2[key] = [{ name: evt?.event_name, date: start }];
      }
    });
    return tmp2;
  }, [eventData]);

  return (
    <div>
      <CustomDatePicker
        fullWidth={true}
        sxType={1}
        value={!selectedDate ? selectedDate : selectedDate.toString()}
        label="Select Date"
        disabled={false}
        defaultStyle={true}
        disablePast={false}
        // disableOld={minStartDate}
        disableFuture={new Date()}
        events={markEvents || []}
        handlePickerChange={(val: any) => {
          console.log("test");
          setSelectedDate(val.toDate());
        }}
      />
    </div>
  );
};

export default AttendanceCalednar;
