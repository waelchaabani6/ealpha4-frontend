/* eslint-disable linebreak-style */
/* eslint-disable operator-linebreak */
/* eslint-disable comma-dangle */
import AdvanceTable from "@component/AdvancedTable/AdvanceTable";
import CustomizedDialogs from "@component/dialog/CustomDialog";
import {
  PASSWORD_REGEX,
  PASSWORD_REGEX_MESSAGE,
  RESULTS_PER_PAGE,
} from "@constants/constants";
import { yupResolver } from "@hookform/resolvers/yup";
import PageTitle from "@shared/pageTitle";
import Wrapper from "@shared/wrapper/Wrapper";
import { getNoOfPages } from "@utility/utility";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Input from "@shared/form/Input";

import * as yup from "yup";
import Button from "@component/button/button";
import toast from "@shared/toast";
import { usePost } from "@shared/api/useApi";
import Dropdown from "@component/dropdown/Dropdown";
import Loader from "@shared/loader";
import { TableColumns } from "./utils";

type FormInputTypes = {
  username: any;
  confirm_password?: any;
};

const userServiceBaseURL = import.meta.env.VITE_APP_USER_SERVICE_URL;

type SearchResultsProps = {
  searchData: any;
  rowsPerPage: number | "All";
  page: number;
  setPage: any;
  totalDataCount: number;
  setRowsPerPage: React.Dispatch<React.SetStateAction<number>>;
  LogListLoading: boolean;
};

export default function SearchResults({
  searchData,
  rowsPerPage,
  page,
  setPage,
  totalDataCount,
  setRowsPerPage,
  LogListLoading,
}: SearchResultsProps) {
  const [order, setOrder] = useState<any>("desc");
  const [orderBy, setOrderBy] = useState<any>("assessment_name");

  const [dialogOpen, setdialogOpen] = useState<boolean>(false);
  const [buttonOpenForm, setButtonOpenForm] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);

  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);

  const shape = {
    confirm_password: yup.string().when("confirm_password", {
      is: (val: any) => val?.length,
      then: yup.string().matches(PASSWORD_REGEX, PASSWORD_REGEX_MESSAGE),
      otherwise: yup.string().optional(),
    }),
  };

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const addSubAdminSchema = yup
    .object()
    .shape(shape, [["confirm_password", "confirm_password"]]);

  const { handleSubmit, control, reset, setValue } = useForm<FormInputTypes>({
    resolver: yupResolver(addSubAdminSchema),
  });

  const onSubmit = (values: any) => {
    const updatedDetails: any = {};
    updatedDetails.username = values?.username;
    updatedDetails.confirm_password = values?.confirm_password;
    mutateUpdateUser(updatedDetails);
  };

  const handlePerPage = (e: any) => {
    setPage(1);
    setRowsPerPage(e);
  };

  const viewHandler = (data: any, handlername: string) => {
    setdialogOpen(true);
    setValue("username", data?.user_name);
  };

  // Update Parent
  const { isLoading: loadingUpdateUser, mutate: mutateUpdateUser } = usePost({
    baseURL: userServiceBaseURL,
    url: "users-service/reset-password/reset-user-password/",
    onSuccess: (response: any) => {
      toast("success", "User Updated successfully");
      setdialogOpen(false);
    },
    onError: ({ response }: any) => {
      toast(
        "error",
        response?.status === 400
          ? "User already exists"
          : response?.statusText || "Error"
      );
    },
  });

  // ----------------------------------------------END API---------------------------------

  return (
    <div className="w-full">
      <div className="bg-white rounded-md p-4">
        <p className="font-bold">Results</p>
        <div className="flex gap-3 justify-end">
          <Dropdown
            title="Result Of Pages"
            value={rowsPerPage}
            dataArray={RESULTS_PER_PAGE}
            onChangeHandler={handlePerPage}
          />
        </div>
        {LogListLoading ? (
          <Loader />
        ) : (
          <Wrapper>
            <AdvanceTable
              tableData={searchData}
              headerRows={TableColumns}
              totalPages={noOfpages}
              paginateHandler={handlePagination}
              currentPage={page}
              rowsPerPage={rowsPerPage}
              orderBy={orderBy}
              setOrderBy={setOrderBy}
              order={order}
              setOrder={setOrder}
              setPage={setPage}
              actionHandler={viewHandler}
            />
          </Wrapper>
        )}
      </div>

      <CustomizedDialogs
        onclose={() => reset()}
        open={dialogOpen}
        setOpen={() => setdialogOpen(false)}
        title={editMode ? "Edit User" : "Reset Password"}
      >
        <form
          className="h-full pb-6"
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex justify-between items-center pb-4">
            <PageTitle title="Login Information" />
            <p className="text-sm text-red-500 opacity-80">
              All (*) marked fields are mandatory
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 content-center gap-y-3 md:gap-x-6">
            <Input
              required={true}
              control={control}
              name="username"
              label="Username"
              disabled={true}
              sxClass={{
                'input[type="text"]': {
                  textTransform: "lowercase",
                },
              }}
              tolowercase={true}
            />
            <Input
              required={true}
              control={control}
              name="confirm_password"
              type="password"
              label="Password"
              autoComplete="new-password"
            />
          </div>

          <div className="py-8 float-right space-x-5">
            <Button
              disabled={loadingUpdateUser}
              loading={loadingUpdateUser}
              onClick={() => setButtonOpenForm(false)}
            >
              {editMode ? "Update" : "Reset"}
            </Button>
          </div>
        </form>
      </CustomizedDialogs>
    </div>
  );
}
