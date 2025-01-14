import Button from "@component/button/button";
import DatePicker from "@component/datepicker";
import CustomizedDialogs from "@component/dialog/CustomDialog";
import { CustomInput } from "@component/input";
import moment from "moment";
import React, { useState } from "react";

const AddHolidayModal = ({ desiderPopup, SetDesiderPopup, onSave }) => {
  const [resonForHoliday, setResonForHoliday] = useState("");
  const [timeStart, setTimeStart] = useState(new Date());
  const [timeEnd, setTimeEnd] = useState(new Date());
  const [dayType, setDayType] = useState("full");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    const numberOfDays = moment(timeEnd).diff(moment(timeStart), "days") + 1;

    const holidayData = {
      holidayName: resonForHoliday,
      startDate: moment(timeStart).format("YYYY-MM-DD"),
      endDate: moment(timeEnd).format("YYYY-MM-DD"),
      numberOfDays,
      dayType,
      description,
    };
    onSave(holidayData);
    SetDesiderPopup(false);
  };

  return (
    <CustomizedDialogs
      open={desiderPopup}
      setOpen={() => {
        SetDesiderPopup(false);
      }}
      title="Add a Holiday"
      className="mycustomedialog"
      maxWidth="900px"
      fullWidth={false}
    >
      <div className="mt-[13px]">
        <CustomInput
          size="small"
          label="Holiday Name:"
          placeholder="Tap the name of the holiday"
          icon={true}
          fullWidth={true}
          value={resonForHoliday}
          onChange={(e) => setResonForHoliday(e.target.value)}
        />
      </div>
      <div className="flex flex-col mt-[21px]">
        <div className="font-bold mb-[30px] flex justify-between items-end">
          <div className="w-[290px]">
            <DatePicker
              value={timeStart}
              label="From Date:"
              handlePickerChange={(val) => setTimeStart(moment(val).toDate())}
              format="DD-MM-YYYY"
              disablePast={false}
              sxType={3}
              defaultStyle={true}
            />
          </div>
          <div className="w-[290px]">
            <DatePicker
              value={timeEnd}
              label="To Date:"
              handlePickerChange={(val) => setTimeEnd(moment(val).toDate())}
              format="DD-MM-YYYY"
              disablePast={false}
              sxType={3}
            />
          </div>
          <div className="w-[200px]">
            <CustomInput
              name="Branch Name"
              label="Number of days"
              parentLabelClass=""
              size="small"
              value={moment(timeEnd).diff(moment(timeStart), "days") + 1}
              disabled={true}
              sx={{ height: "37px" }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-8">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="dayType"
              value="full"
              className="hidden peer"
              checked={dayType === "full"}
              onChange={() => setDayType("full")}
            />
            <div className="w-5 h-5 rounded-full border border-green-500 flex items-center justify-center peer-checked:bg-green-500">
              <div className="w-3 h-3 rounded-full bg-gray peer-checked:bg-white"></div>
            </div>
            <span className="text-[#222222] text-[12px] font-light">
              Full day
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="dayType"
              value="half"
              className="hidden peer"
              checked={dayType === "half"}
              onChange={() => setDayType("half")}
            />
            <div className="w-5 h-5 rounded-full border border-green-500 flex items-center justify-center peer-checked:bg-green-500">
              <div className="w-3 h-3 rounded-full bg-gray peer-checked:bg-white"></div>
            </div>
            <span className="text-[#222222] text-[12px] font-light">
              Half day
            </span>
          </label>
        </div>

        <div>
          <p className="text-[12px] text-light text-[#222222] mt-[27px]">
            Description
          </p>
          <textarea
            className="w-full h-24 border border-gray-300 rounded-md mt-3 ps-[20px] pt-[19px]"
            placeholder="Add text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="actions flex justify-end mt-[36px] gap-[10px]">
          <Button
            sx={{
              width: "120px",
              backgroundColor: "#F5F5F5",
              color: "#4A9D2D",
              border: "1px solid #4A9D2D ",
              "&:hover": {
                backgroundColor: "#F5F5F5",
                
              },
            }}
            onClick={() => SetDesiderPopup(false)}
          >
            Cancel
          </Button>

          <Button sx={{ width: "120px" }} onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </CustomizedDialogs>
  );
};

export default AddHolidayModal;
