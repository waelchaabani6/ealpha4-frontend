import React, { useEffect, useState } from 'react';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import { Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControlLabel,
  FormLabel,
  Radio,
  FormControl,
  RadioGroup, TextField } from '@mui/material';
import Wrapper from '@shared/wrapper/Wrapper';
import { useGet, usePatch, usePost } from '@shared/api/useApi';
import Button from '@component/button/button';
import { useSelector } from 'react-redux';
import toast from '@shared/toast';

type Props = {
    open?: boolean;
    openModal: () => void;
    // eslint-disable-next-line react/no-unused-prop-types
    closeModal:()=>void;
    // eslint-disable-next-line react/no-unused-prop-types
    student?:string[];
  };

const StudentModal = (props:Props) => {
  const [data, setData] = useState<any>([]);
  const { open, student } = props;

  useEffect(() => setData(student), [open, data]);

  return (
    <div>
      <CustomizedDialogs
        maxwidth="sm"
        open={open}
        setOpen={() => {
          props.openModal();
        }}
        sx={{
          '.crossButton': {
            color: 'var(--black) !important'
          },
          '.MuiDialogTitle-root': {
            background: 'var(--white)'
          },
          '& .MuiDialogContent-root': {
            padding: '0px !important'
          }
        }}
      >
        <Wrapper>
          <div className="grid grid-cols-4 gap-4">
            {data?.map((name:any, index:any) => (
              <div key={index} className=" p-4">
                {name}
              </div>
            ))}
          </div>

        </Wrapper>
      </CustomizedDialogs>
    </div>
  );
};

export default React.memo(StudentModal);
