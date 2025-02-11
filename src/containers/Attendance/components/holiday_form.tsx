/* eslint-disable linebreak-style */
import React, { useContext, useEffect, useState } from "react";
import Button from "@component/button/button";
import DatePicker from "@component/datepicker";
import { CustomInput } from "@component/input";
import moment from "moment";
import HolidayDatesContext from "../context";

interface HolidayFormType {
  SetDesiderPopup: (val: boolean) => void;
  onSave: (data: any) => void;
  setShowStatus: (val: boolean) => void;
  isEdit?: boolean;
  isRequestLoading?: boolean;
  setIsRequestLoading?: (val: boolean) => void;
  initialData?: any;
}

const HolidayForm: React.FC<HolidayFormType> = ({
  SetDesiderPopup,
  onSave,
  setShowStatus,
  isEdit = false,
  isRequestLoading = false,
  setIsRequestLoading,
  initialData,
}) => {
  const datesContext = useContext(HolidayDatesContext);

  const [resonForHoliday, setResonForHoliday] = useState("");
  const [timeStart, setTimeStart] = useState(datesContext.start);
  const [timeEnd, setTimeEnd] = useState(datesContext.end);
  const [dayType, setDayType] = useState("full_day");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleHolidayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value.length > 50) {
      setError("Holiday name cannot exceed 50 characters.");
    } else {
      setError(null);
    }

    setResonForHoliday(value.slice(0, 50)); // Ensure max length is 50
  };

  // Function to reset the form
  const resetForm = () => {
    setResonForHoliday("");
    setTimeStart(new Date());
    setTimeEnd(new Date());
    setDayType("full_day");
    setDescription("");
  };

  const handleSave = async () => {
    setIsRequestLoading(true);
    const numberOfDays = moment(timeEnd).diff(moment(timeStart), "days") + 1;
    const holidayData = {
      holidayName: resonForHoliday,
      startDate: moment(timeStart).format("YYYY-MM-DD"),
      endDate: moment(timeEnd).format("YYYY-MM-DD"),
      numberOfDays,
      dayType,
      description,
    };

    // Set loading state if provided
    if (setIsRequestLoading) {
      setIsRequestLoading(true);
    }

    try {
      await onSave(holidayData); // Save data via parent handler
      resetForm(); // Reset the form fields
      setShowStatus(true); // Show the status view
      setIsRequestLoading(false); // Reset loading state
    } catch (error) {
      console.error("Error saving holiday:", error);
    } finally {
      if (setIsRequestLoading) {
        setIsRequestLoading(false);
      }
    }
  };

  React.useEffect(() => {
    if (isEdit && initialData) {
      setResonForHoliday(initialData.title);
      setTimeStart(new Date(initialData.start));
      setTimeEnd(new Date(initialData.end));
      setDayType(initialData.holidayType);
      setDescription(initialData.description);
    }
  }, [isEdit, initialData]);

  return (
    <div>
      <div className="mt-[13px]">
        <CustomInput
          size="small"
          label="Holiday Name:"
          placeholder="Tap the name of the holiday"
          icon={true}
          fullWidth={true}
          value={resonForHoliday}
          onChange={handleHolidayNameChange}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
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
              value="full_day"
              className="hidden peer"
              checked={dayType === "full_day"}
              onChange={() => setDayType("full_day")}
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
              value="half_day"
              className="hidden peer"
              checked={dayType === "half_day"}
              onChange={() => setDayType("half_day")}
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
            maxLength={100}
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
            onClick={() => {
              SetDesiderPopup(false);
              resetForm();
            }}
          >
            Cancel
          </Button>

          <Button
            sx={{ width: "120px" }}
            onClick={handleSave}
            loading={isRequestLoading} // Add loading indicator if applicable
          >
            {isEdit ? "Update" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HolidayForm;
