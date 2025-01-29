import CustomPagination from "@shared/customPagination";
import React, { useEffect, useState } from "react";
import { ReactComponent as Trash } from "@images/icons/trash.svg";
import { ReactComponent as Pin } from "@images/icons/green_pin.svg";

type EventTypeData = {
  id: number;
  title: string;
  description: string;
  start: string;
  end: string;
  holidayType: string;
};

type HolidayListPropsType = {
  eventsData: EventTypeData[];
  onEdit: (holidayData: any) => void;
  onDelete: (id: number) => void;
};

const HolidayList: React.FC<HolidayListPropsType> = ({
  eventsData,
  onEdit,
  onDelete,
}) => {
  const [listOfHolidays, setListOfHolidays] =
    useState<EventTypeData[]>(eventsData);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const totalPages = Math.ceil(listOfHolidays.length / itemsPerPage);

  useEffect(() => {
    setListOfHolidays(eventsData);
  }, [eventsData]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Get the current holidays for the page
  const currentHolidays = listOfHolidays.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Function to calculate the duration between two dates
  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    let duration = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return duration === 0 ? 1 : duration; 
  };
  

  return (
    <div className="p-6">
      <div className="max-h-[480px]">
        {currentHolidays.map((holiday) => (
          <div
            key={holiday.id}
            className="bg-white shadow-md rounded-lg p-6 mb-4 border border-gray-200"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-center">
                <div className="h-6 w-1 bg-green-500 mr-2"></div>
                <p className="text-sm text-gray-500 space-y-1">
                  <span className="font-bold">From:</span>{" "}
                  <span className="font-medium text-gray-700">
                    {new Date(holiday.start).toDateString()}
                  </span>{" "}
                  <span className="font-bold">To:</span>{" "}
                  <span className="font-medium text-gray-700">
                    {new Date(holiday.end).toDateString()}
                  </span>{" "}
                  <span className="font-bold">Duration:</span>{" "}
                  <span className="font-medium">
                    {calculateDuration(holiday.start, holiday.end)} days
                  </span>{" "}
                  <span className="font-bold">Type:</span>{" "}
                  <span className="font-medium">{holiday.holidayType}</span>
                </p>
              </div>
              <div className="flex items-center mt-4 md:mt-0">
                <button
                  className="text-green-500 hover:text-green-700 transition-colors duration-200 flex items-center mr-3"
                  title="Edit"
                  onClick={() => onDelete(holiday.id)}
                >
                  <Trash />
                </button>
                <button
                  className="text-red-500 hover:text-red-700 transition-colors duration-200 flex items-center"
                  title="Delete"
                  onClick={() => onEdit(holiday)}
                >
                  <Pin />
                </button>
              </div>
            </div>

            <div>
              <span className="font-bold text-lg">{holiday.title} :</span>
              <span className="font-medium text-gray-700">
                {" "}
                {holiday.description}
              </span>{" "}
            </div>
          </div>
        ))}
      </div>

      <CustomPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default HolidayList;
