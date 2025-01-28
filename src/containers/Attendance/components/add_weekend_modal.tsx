import CustomizedDialogs from "@component/dialog/CustomDialog";
import React, { useEffect, useState } from "react";
import HolidayStatus from "./holiday_status"; // Import HolidayStatus component

const AddWeekendModal = ({
  isOpen,
  onClose,
  onSave,
  isRequestLoading,
  setIsRequestLoading,
  initialData = null,
  weekendsResponseeStatus, // Response status
}) => {
  const [selectedDays, setSelectedDays] = useState([]); // Array to hold selected days
  const [endsAfter, setEndsAfter] = useState("never"); // 'never' or 'after'
  const [afterValue, setAfterValue] = useState("");
  const [currentView, setCurrentView] = useState("form"); // To handle form and status views
  const endsAfterOptions = [
    {
      value: "never",
      label: "Never",
    },
    { value: "3-month", label: "3 months" },
    { value: "6-month", label: "6 months" },
    { value: "current_academic_year", label: "Current Academic Year" },
  ]; // Options for 'endsAfter' radio buttons

  // Status message for HolidayStatus component
  const statusMessage = weekendsResponseeStatus
    ? "The weekend has been successfully saved."
    : "Failed to save the weekend. Please try again.";

  useEffect(() => {
    if (initialData) {
      setSelectedDays(initialData.days || []); // Set selected days
      setEndsAfter(initialData.ends_after || "never"); // Set radio button value
      setAfterValue(initialData.ends_after || ""); // Set dropdown value (if needed)
    } else {
      setSelectedDays([]);
      setEndsAfter("never"); // Default radio selection
      setAfterValue(""); // Reset dropdown value
    }
  }, [initialData]);

  // Toggle day selection
  const toggleDaySelection = (day) => {
    setSelectedDays(
      (prevDays) =>
        prevDays.includes(day)
          ? prevDays.filter((d) => d !== day) // Remove day if already selected
          : [...prevDays, day] // Add day if not selected
    );
  };

  // Reset form
  const resetForm = () => {
    setSelectedDays([]);
    setEndsAfter("never");
    setAfterValue("");
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Save handler
  const handleSave = () => {
    if (selectedDays.length === 0) {
      alert("Please select at least one day.");
      return;
    }
    if (endsAfter === "after" && !afterValue) {
      alert("Please select a period.");
      return;
    }

    setIsRequestLoading(true);

    const weekendData = {
      days: selectedDays, // Array of selected days
      ends_after: endsAfter === "never" ? "never" : afterValue, // Ends after value
    };

    onSave(weekendData); // Pass data to parent
    setCurrentView("status"); // Switch to status view
  };

  const handleClose = () => {
    onClose();
    setCurrentView("form");
  };

  return (
    <CustomizedDialogs
      open={isOpen}
      setOpen={() => {
        onClose();
        setCurrentView("form");
      }}
      title={initialData ? "Edit Weekend" : "Add Weekend"}
      className="weekendModal"
      maxWidth="600px"
      fullWidth={false}
    >
      {currentView === "status" ? (
        <HolidayStatus
          type={weekendsResponseeStatus ? "success" : "error"}
          message={statusMessage}
          onClose={handleClose}
          isLoader={isRequestLoading}
        />
      ) : (
        <div className="weekend-form">
          <h3>Select Days *</h3>
          <div className="days-selector">
            {[
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ].map((day) => (
              <button
                key={day}
                className={`day-button ${
                  selectedDays.includes(day) ? "active" : ""
                }`}
                onClick={() => toggleDaySelection(day)}
              >
                {day.substring(0, 1)} {/* Show abbreviated day */}
              </button>
            ))}
          </div>
          {selectedDays.length === 0 && (
            <p className="error-text">* Please select at least one day.</p>
          )}

          <h3>Ends After</h3>
          <div className="ends-after-options">
            <label className="ends-after-option">
              <input
                type="radio"
                name="endsAfter"
                value="never"
                checked={endsAfter === "never"} // Check for "never"
                onChange={() => {
                  setEndsAfter("never");
                  setAfterValue(""); // Clear dropdown value if "never" is selected
                }}
              />
              Never
            </label>
            <label className="ends-after-option">
              <input
                type="radio"
                name="endsAfter"
                value="after"
                checked={endsAfter !== "never"} // Check for any value other than "never"
                onChange={() => {
                  setEndsAfter("after"); // Set to "after" for dropdown display
                  if (!afterValue) setAfterValue("3-month"); // Default dropdown value
                }}
              />
              After
              {endsAfter !== "never" && (
                <select
                  className="ends-after-dropdown"
                  value={afterValue}
                  onChange={(e) => setAfterValue(e.target.value)}
                >
                  <option value="">Select</option>
                  {endsAfterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </label>
          </div>

          {endsAfter === "after" && !afterValue && (
            <p className="error-text">* Please select a period.</p>
          )}

          <div className="modal-actions">
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button
              className="save-button"
              onClick={handleSave}
              disabled={isRequestLoading}
            >
              {isRequestLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </CustomizedDialogs>
  );
};

export default AddWeekendModal;
