import { SxProps } from "@mui/system";
import LoadingButton from "@mui/lab/LoadingButton";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";

type ButtonProps = {
  size?: "small" | "medium" | "large";
  type?: "button" | "submit" | "reset";
  variant?: "contained" | "outlined";
  children?: React.ReactNode;
  onClick?: (ev: React.MouseEvent<HTMLButtonElement>) => void;
  sx?: SxProps;
  loading?: boolean;
  className?: string;
  disabled?: boolean;
  component?: any;
  tooltipMessage?: string;
};
Button.defaultProps = {
  size: "medium",
  variant: "contained",
  type: "submit",
  sx: {},
  loading: false,
  disabled: false,
};
export default function Button({
  children,
  sx,
  tooltipMessage,
  ...rest
}: ButtonProps) {
  const attributes = {
    ...rest,
    sx: {
      fontWeight: 700,
      color: rest.variant === "contained" ? "white" : "black",
      backgroundColor: rest.variant === "contained" ? "var(--accent)" : "white",
      borderColor: "var(--accent)",
      "&:hover": {
        backgroundColor:
          rest.variant === "contained" ? "var(--accent)" : "white",
        borderColor: "var(--accent)",
      },
      ...sx,
    },
    loadingIndicator: <CircularProgress color="inherit" size={20} />,
  };
  return (
    <Tooltip
      title={rest.disabled ? tooltipMessage || "" : ""}
      arrow
      placement="top"
    >
      <span>
        <LoadingButton {...attributes}>{children}</LoadingButton>
      </span>
    </Tooltip>
  );
}

// Custom Icon Button
type IconButton = {
  children?: React.ReactNode;
  sx?: SxProps | undefined;
  onClick?: any;
};
IconButton.defaultProps = {
  children: <AddIcon />,
};
export function IconButton(props: IconButton): JSX.Element {
  return (
    <Button
      className="bg-red-500"
      {...props}
      sx={{
        boxShadow: "3",
        minWidth: "40px",
        minHeight: "40px",
        padding: "8px",
        backgroundColor: "white",
        "&:hover": {
          backgroundColor: "white",
          border: "none",
          outline: "none",
          boxShadow: "none",
        },
        ">*": {
          color: "black",
        },
        "> img": {
          width: "24px",
          height: "24px",
        },
        "@media (max-width: 520px)": {
          padding: "4px",
          minWidth: "unset",
          minHeight: "unset",
          "> img": {
            width: "14px",
            height: "14px",
          },
          "> svg": {
            width: "14px",
            height: "14px",
          },
        },
        ...props.sx,
      }}
    >
      {props?.children}
    </Button>
  );
}
