import CustomizedDialogs from "@component/dialog/CustomDialog";
import React, { useEffect, useState } from "react";
import HolidayStatus from "./holiday_status";
import HolidayForm from "./holiday_form";
import HolidayList from "./list_holidays";
import Loader from "@shared/loader";

const AddHolidayModal = ({
  desiderPopup,
  SetDesiderPopup,
  onSave,
  onEdit,
  onDelete,
  holidayResponseStatus,
  eventsData,
  isCreateLoading,
  isEditLoading,
  setIsCreateLoading,
  setIsEditLoading,
  currentView,
  setCurrentView,
  isEdit,
  editDataOnSelect,
}) => {
  const [currentEditData, setCurrentEditData] = useState(null);

  const statusMessage = holidayResponseStatus
    ? "The holidays and days off have been successfully marked on the calendar. Your updates are now visible to all users"
    : "Unable to connect to the server. Please check your internet connection and try again";

  const handleClose = () => {
    SetDesiderPopup(false);
    setCurrentView("list");
    setCurrentEditData(null); // Reset edit data on close
  };

  useEffect(() => {
    if (isEdit && editDataOnSelect) {
      setCurrentEditData(editDataOnSelect);
      setCurrentView("edit");
      console.log("editDataOnSelect", editDataOnSelect);
    }
  }, [editDataOnSelect]);

  return (
    <CustomizedDialogs
      open={desiderPopup}
      setOpen={handleClose}
      title={
        currentView === "create"
          ? "Add a Holiday"
          : currentView === "edit"
          ? "Edit Holiday"
          : "Holiday List"
      }
      className="schoolHolidayModal"
      maxWidth="900px"
      fullWidth={false}
    >
      {currentView === "status" ? (
        <HolidayStatus
          type={holidayResponseStatus ? "success" : "error"}
          message={statusMessage}
          onClose={handleClose}
          onConfirm={handleClose}
          isLoader={isCreateLoading || isEditLoading}
        />
      ) : currentView === "create" ? (
        <HolidayForm
          setShowStatus={() => setCurrentView("status")}
          SetDesiderPopup={SetDesiderPopup}
          onSave={onSave}
          isRequestLoading={isCreateLoading}
          setIsRequestLoading={setIsCreateLoading}
        />
      ) : currentView === "edit" ? (
        <HolidayForm
          setShowStatus={() => setCurrentView("status")}
          SetDesiderPopup={SetDesiderPopup}
          isEdit
          onSave={onSave}
          initialData={currentEditData}
          isRequestLoading={isEditLoading}
          setIsRequestLoading={setIsEditLoading}
        />
      ) : (
        <HolidayList
          eventsData={eventsData.filter((event) => event.title !== "Weekend")}
          onEdit={(event) => {
            setCurrentEditData(event);
            setCurrentView("edit");
          }}
          onDelete={(id) => {
            onDelete(id);
          }}
        />
      )}
    </CustomizedDialogs>
  );
};

export default AddHolidayModal;
