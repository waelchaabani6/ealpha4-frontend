import CustomizedDialogs from "@component/dialog/CustomDialog";
import React, { useEffect, useState } from "react";
import HolidayStatus from "./holiday_status";
import HolidayForm from "./holiday_form";
import HolidayList from "./list_holidays";
import Loader from "@shared/loader";
import Button from "@component/button/button";

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
  const [deleteId, setDeleteId] = useState(null); // Stores the ID of the item to delete

  const statusMessage = holidayResponseStatus
    ? "The holidays and days off have been successfully marked on the calendar. Your updates are now visible to all users"
    : "Unable to connect to the server. Please check your internet connection and try again";

  const handleClose = () => {
    SetDesiderPopup(false);
    setCurrentView("list");
    setCurrentEditData(null); // Reset edit data on close
  };

  const handleConfirm = () => {
    setCurrentView("list");
    setCurrentEditData(null); // Reset edit data on close
  };

  useEffect(() => {
    if (isEdit && editDataOnSelect) {
      setCurrentEditData(editDataOnSelect);
      setCurrentView("edit");
    }
  }, [editDataOnSelect]);

  // Handle delete confirmation
  const handleDelete = (id) => {
    setDeleteId(id);
    setCurrentView("deleteConfirm");
  };

  // Confirm delete action
  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
      setCurrentView("list");
    }
  };

  return (
    <CustomizedDialogs
      open={desiderPopup}
      setOpen={handleClose}
      title={
        currentView === "create"
          ? "Add Holiday"
          : currentView === "edit"
          ? "Edit Holiday"
          : currentView === "deleteConfirm"
          ? "Delete Holiday"
          : "Holidays"
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
          onConfirm={handleConfirm}
          isLoader={isCreateLoading || isEditLoading}
        />
      ) : currentView === "deleteConfirm" ? (
        // Delete confirmation step
        <div className="flex flex-col items-center justify-center text-center gap-4 p-5">
          <h3 className="text-lg font-semibold">
            Are you sure you want to delete this holiday?
          </h3>
          <p className="text-sm text-gray-600">This action cannot be undone.</p>
          <div className="flex gap-4 mt-4">
            <Button
              className="px-4 py-2 border border-gray-400 text-gray-700 rounded-md hover:bg-gray-200 transition"
              onClick={() => setCurrentView("list")}
              variant="outlined"
            >
              No, Cancel
            </Button>
            <Button
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              onClick={confirmDelete}
            >
              Yes, Delete
            </Button>
          </div>
        </div>
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
            onEdit(event);
            setCurrentEditData(event);
            setCurrentView("edit");
          }}
          onDelete={handleDelete} // Trigger delete confirmation
        />
      )}
    </CustomizedDialogs>
  );
};

export default AddHolidayModal;
