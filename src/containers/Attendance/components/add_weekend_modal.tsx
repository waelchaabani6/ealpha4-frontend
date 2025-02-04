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
  const [endsAfter, setEndsAfter] = useState(""); // 'never' or 'after'
  const [afterValue, setAfterValue] = useState(""); // For dropdown selection
  const [currentView, setCurrentView] = useState("form"); // Handles form, confirmation, and status views

  const MAX_DAYS = 3; // Maximum allowed days selection

  const endsAfterOptions = [
    { value: "never", label: "Never" },
    { value: "3-month", label: "3 months" },
    { value: "6-month", label: "6 months" },
    { value: "current_academic_year", label: "Current Academic Year" },
  ];

  // Status message for HolidayStatus component
  const statusMessage = weekendsResponseeStatus
    ? "The weekend has been successfully saved."
    : "Failed to save the weekend. Please try again.";

  useEffect(() => {
    if (initialData) {
      setSelectedDays(initialData.days || []);

      if (initialData.ends_after && initialData.ends_after !== "never") {
        setEndsAfter("after");
        setAfterValue(initialData.ends_after);
      } else {
        setEndsAfter("never");
        setAfterValue("");
      }
    } else {
      setSelectedDays([]);
      setEndsAfter("");
      setAfterValue("");
    }
  }, [initialData]);

  // Toggle day selection (Max 3 Days)
  const toggleDaySelection = (day) => {
    setSelectedDays((prevDays) => {
      if (prevDays.includes(day)) {
        return prevDays.filter((d) => d !== day); // Remove day if already selected
      } else {
        if (prevDays.length >= MAX_DAYS) {
          alert(`You can only select up to ${MAX_DAYS} days.`);
          return prevDays; // Do not add more days if max reached
        }
        return [...prevDays, day]; // Add day if not selected
      }
    });
  };

  // Reset form
  const resetForm = () => {
    setSelectedDays([]);
    setEndsAfter("");
    setAfterValue("");
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Save handler - Show Confirmation First
  const handleSave = () => {
    if (selectedDays.length === 0) {
      alert("Please select at least one day.");
      return;
    }
    if (endsAfter === "after" && !afterValue) {
      alert("Please select a period.");
      return;
    }

    setCurrentView("confirm"); // Show confirmation message before saving
  };

  // Confirm Save
  const confirmSave = () => {
    setIsRequestLoading(true);

    const weekendData = {
      days: selectedDays,
      ends_after: endsAfter === "never" ? "never" : afterValue,
    };

    onSave(weekendData);
    setCurrentView("status"); // Switch to status view after save
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
      {currentView === "confirm" ? (
        // Confirmation Step
        <div className="confirmation-view">
          <h3>Are you sure you want to save these weekend changes?</h3>
          <div className="modal-actions">
            <button className="cancel-button" onClick={() => setCurrentView("form")}>
              No
            </button>
            <button className="save-button" onClick={confirmSave} disabled={isRequestLoading}>
              Yes
            </button>
          </div>
        </div>
      ) : currentView === "status" ? (
        // Success or Error Message
        <HolidayStatus
          type={weekendsResponseeStatus ? "success" : "error"}
          message={statusMessage}
          onClose={handleClose}
          isLoader={isRequestLoading}
        />
      ) : (
        // Form View
        <div className="weekend-form">
          <h3>Select Days * (Max {MAX_DAYS} Days)</h3>
          <div className="days-selector">
            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
              <button
                key={day}
                className={`day-button ${selectedDays.includes(day) ? "active" : ""}`}
                onClick={() => toggleDaySelection(day)}
              >
                {day.substring(0, 1)}
              </button>
            ))}
          </div>
          {selectedDays.length === 0 && <p className="error-text">* Please select at least one day.</p>}

          <h3>Ends After</h3>
          <div className="ends-after-options">
            <label className="ends-after-option">
              <input
                type="radio"
                name="endsAfter"
                value="never"
                checked={endsAfter === "never"}
                onChange={() => {
                  setEndsAfter("never");
                  setAfterValue("");
                }}
              />
              Never
            </label>
            <label className="ends-after-option">
              <input
                type="radio"
                name="endsAfter"
                value="after"
                checked={endsAfter === "after"}
                onChange={() => {
                  setEndsAfter("after");
                  if (!afterValue) setAfterValue(""); 
                }}
              />
              After
              {endsAfter === "after" && (
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

          {!endsAfter && <p className="error-text">* Please select a period.</p>}
          {endsAfter === "after" && !afterValue && <p className="error-text">* Please select a duration.</p>}

          <div className="modal-actions">
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button className="save-button" onClick={handleSave} disabled={isRequestLoading}>
              {isRequestLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </CustomizedDialogs>
  );
};

export default AddWeekendModal;
