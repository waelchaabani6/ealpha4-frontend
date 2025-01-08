/* eslint-disable operator-linebreak */
/* eslint-disable comma-dangle */
import Button from '@component/button/button';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { useGet, usePatch, usePost } from '@shared/api/useApi';
import Loader from '@shared/loader';
import toast from '@shared/toast';
import Wrapper from '@shared/wrapper/Wrapper';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

type Props = {
  dialogOpen?: boolean;
  openModal: () => void;
  closeModal: () => void;
};

const Setting = (props: Props) => {
  const { dialogOpen } = props;
  const userData = useSelector((state: any) => state?.user);
  const [PerData, setPerData] = useState([]);
  const [val, setValue] = React.useState({
    Nmeet1: '',
    Nmeet2: '',
    above1: '',
    above2: '',
    exceed1: '',
    exceed2: '',
    meet1: '',
    meet2: '',
    approching1: '',
    approching2: '',
  });
  const ReportURL = import.meta.env.VITE_APP_REPORTS_SERVICE_URL;

  const handleChange = (event: any) => {
    // eslint-disable-next-line no-shadow
    const { name, value } = event.target;
    setValue({ ...val, [name]: value });
  };
  const SettingData: any = [
    {
      from_value: val?.meet1,
      to_value: val?.meet2,
      status: 'Meets',
      created_by: userData.userId,
      updated_by: userData.userId,
    },
    {
      from_value: val?.approching1,
      to_value: val?.approching2,
      status: 'Approaching',
      created_by: userData.userId,
      updated_by: userData.userId,
    },
    {
      from_value: val?.above1,
      to_value: val?.above2,
      status: 'Above',
      created_by: userData.userId,
      updated_by: userData.userId,
    },
    {
      from_value: val?.exceed1,
      to_value: val?.exceed2,
      status: 'Exceeds',
      created_by: userData.userId,
      updated_by: userData.userId,
    },
    {
      from_value: val?.Nmeet1,
      to_value: val?.Nmeet2,
      status: 'Does Not Meet',
      created_by: userData.userId,
      updated_by: userData.userId,
    },
  ];

  const { mutate: UpdatePerformance } = usePatch({
    baseURL: ReportURL,
    url: `reports-service/update_performance_expectation/${userData.userId}/`,
    onSuccess: (response: any) => {
      toast('success', 'Performance Updated successfully.');
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    },
  });

  const { isLoading, mutate: PerformanceData } = usePost({
    baseURL: ReportURL,
    url: `reports-service/create_performance_expectation/`,
    onSuccess: (response: any) => {
      toast('success', 'Performance Added successfully.');
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    },
  });

  const { isLoading: performance, refetch: GetPerformance } = useGet({
    baseURL: ReportURL,
    url: `reports-service/performance_expectation/?user_id=${userData.userId}`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response;
      const body: any = [];
      const fetchedRecords = resp?.slice(0, 5);
      setPerData(fetchedRecords);

      const meetObj = fetchedRecords?.find(
        (obj: any) => obj.status === 'Meets'
      );
      const aboveObj = fetchedRecords?.find(
        (obj: any) => obj.status === 'Above'
      );
      const AppObj = fetchedRecords?.find(
        (obj: any) => obj.status === 'Approaching'
      );
      const DMeetObj = fetchedRecords?.find(
        (obj: any) => obj.status === 'Does Not Meet'
      );
      const ExceedsObj = fetchedRecords?.find(
        (obj: any) => obj.status === 'Exceeds'
      );

      setValue((prevState: any) => ({
        ...prevState,
        meet1: meetObj?.from_value,
        meet2: meetObj?.to_value,
        above1: aboveObj?.from_value,
        above2: aboveObj?.to_value,
        exceed1: ExceedsObj?.from_value,
        exceed2: ExceedsObj?.to_value,
        approching1: AppObj?.from_value,
        approching2: AppObj?.to_value,
        Nmeet1: DMeetObj?.from_value,
        Nmeet2: DMeetObj?.to_value,
      }));
    },
    enabled: false,
    retry: false,
  });

  const Submit = () => {
    if (
      val?.Nmeet1 === '' ||
      val.Nmeet2 === '' ||
      val.above1 === '' ||
      val.above2 === '' ||
      val.exceed2 === '' ||
      val.exceed1 === '' ||
      val.exceed2 === '' ||
      val.meet1 === '' ||
      val.meet2 === '' ||
      val.approching1 === '' ||
      val.approching2 === ''
    ) {
      toast('error', 'please add required details');
    } else if (PerData?.length === 5) {
      UpdatePerformance(SettingData);
      props.closeModal();
      setValue({
        Nmeet1: '',
        Nmeet2: '',
        above1: '',
        above2: '',
        exceed1: '',
        exceed2: '',
        meet1: '',
        meet2: '',
        approching1: '',
        approching2: '',
      });
    } else {
      PerformanceData(SettingData);
      props.closeModal();
      setValue({
        Nmeet1: '',
        Nmeet2: '',
        above1: '',
        above2: '',
        exceed1: '',
        exceed2: '',
        meet1: '',
        meet2: '',
        approching1: '',
        approching2: '',
      });
    }
  };

  useEffect(() => {
    if (dialogOpen) {
      GetPerformance();
    }
  }, [dialogOpen]);

  return (
    <>
      <CustomizedDialogs
        maxwidth="sm"
        open={dialogOpen}
        setOpen={() => {
          props.openModal();
        }}
        sx={{
          '.crossButton': {
            color: 'var(--black) !important',
          },
          '.MuiDialogTitle-root': {
            background: 'var(--white)',
          },
          '& .MuiDialogContent-root': {
            padding: !performance ? '0px !important' : '',
          },
        }}
      >
        {performance ? (
          <div>
            <Loader />
          </div>
        ) : (
          <Wrapper
            customCSS={{
              '.MuiTable-root.MuiTable-stickyHeader': {
                minWidth: 'unset',
              },
            }}
          >
            <TableContainer className="relative" sx={{ maxHeight: '100%' }}>
              <Table stickyHeader={true} aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell key="1" align="left">
                      Expectations
                    </TableCell>
                    <TableCell key="2" align="center">
                      From %
                    </TableCell>
                    <TableCell key="3" align="center">
                      To %
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                    <TableCell key="1" align="left" className="bg-[#BECCFF]">
                      Exceeds
                    </TableCell>
                    <TableCell key="2" align="center">
                      <div className="flex items-center justify-center">
                        <TextField
                          placeholder="Enter Value"
                          name="exceed1"
                          type="number"
                          // label="Enter your name"
                          value={val.exceed1}
                          onChange={handleChange}
                          sx={{ width: '150px' }}
                        />
                      </div>
                    </TableCell>
                    <TableCell key="3" align="center">
                      <div className="flex items-center justify-center">
                        <TextField
                          placeholder="Enter Value"
                          type="number"
                          sx={{ width: '150px' }}
                          name="exceed2"
                          // label="Enter your name"
                          value={val.exceed2}
                          onChange={handleChange}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                    <TableCell key="1" align="left" className="bg-[#d9ffc8]">
                      Above
                    </TableCell>
                    <TableCell key="2" align="center">
                      <div className="flex items-center justify-center">
                        <TextField
                          placeholder="Enter Value"
                          name="above1"
                          type="number"
                          // label="Enter your name"
                          value={val.above1}
                          onChange={handleChange}
                          sx={{ width: '150px' }}
                        />
                      </div>
                    </TableCell>
                    <TableCell key="3" align="center">
                      <div className="flex items-center justify-center">
                        <TextField
                          placeholder="Enter Value"
                          type="number"
                          sx={{ width: '150px' }}
                          name="above2"
                          // label="Enter your name"
                          value={val.above2}
                          onChange={handleChange}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                    <TableCell key="1" align="left" className="bg-[#FFF9BE]">
                      Meets
                    </TableCell>

                    <TableCell key="2" align="center">
                      <div className="flex items-center justify-center">
                        <TextField
                          sx={{ width: '150px' }}
                          placeholder="Enter Value"
                          type="number"
                          name="meet1"
                          value={val.meet1}
                          onChange={handleChange}
                        />
                      </div>
                    </TableCell>
                    <TableCell key="3" align="center">
                      <div className="flex items-center justify-center">
                        <TextField
                          placeholder="Enter Value"
                          sx={{ width: '150px' }}
                          type="number"
                          name="meet2"
                          // label="Enter your name"
                          value={val.meet2}
                          onChange={handleChange}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                    <TableCell key="1" align="left" className="bg-[#FFD6A5]">
                      Approaching
                    </TableCell>
                    <TableCell key="2" align="center">
                      <div className="flex items-center justify-center">
                        <TextField
                          placeholder="Enter Value"
                          type="number"
                          sx={{ width: '150px' }}
                          name="approching1"
                          value={val.approching1}
                          onChange={handleChange}
                        />
                      </div>
                    </TableCell>

                    <TableCell key="3" align="center">
                      <div className="flex items-center justify-center">
                        <TextField
                          placeholder="Enter Value"
                          type="number"
                          sx={{ width: '150px' }}
                          name="approching2"
                          value={val.approching2}
                          onChange={handleChange}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                    <TableCell key="1" align="left" className="bg-[#FCD4C6]">
                      Does Not Meet
                    </TableCell>
                    <TableCell key="2" align="center">
                      <div className="flex items-center justify-center">
                        <TextField
                          placeholder="Enter Value"
                          type="number"
                          sx={{ width: '150px' }}
                          name="Nmeet1"
                          // label="Enter your name"
                          value={val.Nmeet1}
                          onChange={handleChange}
                        />
                      </div>
                    </TableCell>
                    <TableCell key="3" align="center">
                      <div className="flex items-center justify-center">
                        <TextField
                          placeholder="Enter Value"
                          type="number"
                          name="Nmeet2"
                          // label="Enter your name"
                          value={val.Nmeet2}
                          onChange={handleChange}
                          sx={{ width: '150px' }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <div className="flex">
              <div className="mt-2 ml-auto">
                <Button size="medium" onClick={Submit}>
                  Save
                </Button>
              </div>
            </div>
          </Wrapper>
        )}
      </CustomizedDialogs>
    </>
  );
};

export default React.memo(Setting);
