import React from "react";
import Button from "@component/button/button"; // Replace with your button component import
import CustomizedDialogs from "@component/dialog/CustomDialog";

type StatusModalProps = {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "error";
  message: string;
};

const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  onClose,
  type,
  message,
}) => {
  const getModalStyles = () => {
    return type === "success"
      ? { bgColor: "bg-green-100", textColor: "text-green-600", icon: "✔️" }
      : { bgColor: "bg-red-100", textColor: "text-red-600", icon: "❌" };
  };

  const { bgColor, textColor, icon } = getModalStyles();

  return (
    <CustomizedDialogs
      open={isOpen}
      setOpen={onClose}
      maxWidth="900px"
      fullWidth={false}
      className="schoolHolidayModal"
    >
      <div className={`p-6 rounded-lg ${bgColor}`}>
        <div className="flex items-center space-x-4">
          <span className={`text-2xl ${textColor}`}>{icon}</span>
          <h2 className={`text-lg font-semibold ${textColor}`}>
            {type === "success" ? "Success" : "Error"}
          </h2>
        </div>
        <p className="mt-2 text-gray-600">{message}</p>
        <div className="mt-4 text-right">
          <Button
            onClick={onClose}
            sx={{
              backgroundColor: type === "success" ? "#4CAF50" : "#F44336",
              color: "#FFFFFF",
              "&:hover": {
                backgroundColor: type === "success" ? "#45A049" : "#E53935",
              },
            }}
          >
            Close
          </Button>
        </div>
      </div>
    </CustomizedDialogs>
  );
};

export default StatusModal;
