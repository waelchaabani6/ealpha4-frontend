import React from "react";
import Button from "@component/button/button"; // Replace with your button component import
import { ReactComponent as SucessIcon } from "@images/icons/success.svg";
import { ReactComponent as AlertIcon } from "@images/icons/alert.svg";
import Loader from "@shared/loader";

type StatusModalProps = {
  type: "success" | "error";
  message: string;
  onClose?: () => void;
  onConfirm?: () => void;
  isLoader?: boolean;
};

const HolidayStatus: React.FC<StatusModalProps> = ({
  type,
  message,
  onClose,
  onConfirm,
  isLoader,
}) => {
  const getModalStyles = () => {
    return type === "success"
      ? {
          bgColor: "",
          textColor: "text-green-600",
          icon: SucessIcon,
        }
      : { bgColor: "", textColor: "text-red-600", icon: AlertIcon };
  };

  const { bgColor, textColor, icon } = getModalStyles();

  return (
    <div className={`p-6 rounded-lg text-center ${bgColor}`}>
      {isLoader ? (
        <Loader />
      ) : (
        <>
          <div className="flex flex-col items-center space-y-4">
            <div>{React.createElement(icon)}</div>
            <h2 className={`text-2xl font-semibold ${textColor}`}>
              {type === "success" ? "Success!" : "Error!"}
            </h2>
            <p className="mt-2 text-gray-600">{message}</p>
          </div>
          {type === "success" ? (
            <div className="mt-6 flex flex-col space-y-4 w-[281px] mx-auto">
              <Button
                onClick={onClose}
                sx={{
                  backgroundColor: "#4CAF50",
                  color: "#FFFFFF",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  "&:hover": {
                    backgroundColor: "#45A049",
                  },
                }}
              >
                View the updated calendar
              </Button>
              {onConfirm && (
                <Button
                  onClick={onConfirm}
                  sx={{
                    backgroundColor: "#FFFFFF",
                    color: "#4CAF50",
                    border: "1px solid #4CAF50",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    "&:hover": {
                      backgroundColor: "#F9F9F9",
                    },
                  }}
                >
                  Edit Holidays
                </Button>
              )}
            </div>
          ) : (
            <div className="mt-6 flex flex-col space-y-4 w-[281px] mx-auto">
              <Button
                onClick={onClose}
                sx={{
                  backgroundColor: "#4CAF50",
                  color: "#FFFFFF",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  "&:hover": {
                    backgroundColor: "#45A049",
                  },
                }}
              >
                Ok
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HolidayStatus;
