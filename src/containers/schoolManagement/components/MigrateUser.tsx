import CustomizedDialogs from '@component/dialog/CustomDialog';
import { CustomInput } from '@component/input';
import Button from '@component/button/button';
import { useEffect, useState } from 'react';
import Dropdown from '../../../components/dropdown/Dropdown';

const MigrateUser = (props: any) => {
  const {
    migrateDialog,
    setMigrateDialog,
    title,
    setSchoolName,
    mutateMigrateBranch,
    setBranchName,
    migraToData,
    propDatas,
    loading
  } = props;
  const branchArray = (migraToData || [])?.map((i: any) => ({
    label: i?.branch_name,
    value: i?.id
  }));

  const [selectedBranch, setselectedBranch] = useState('');

  const onSubmit = () => {
    const payload = {
      school_id: propDatas?.school_id,
      current_branch_id: propDatas?.id,
      target_branch_id: selectedBranch,
      remove_branch: false
    };
    mutateMigrateBranch(payload);
  };
  useEffect(() => {
    setselectedBranch('');
  }, [propDatas]);

  return (
    <CustomizedDialogs title={title} open={migrateDialog} setOpen={setMigrateDialog}>
      <div className="flex flex-col gap-8">
        <CustomInput
          label="School Name"
          disabled={true}
          value={propDatas?.school_name || ''}
          onChange={(e: any) => setSchoolName(e.target.value)}
          icon={true}
          size="small"
        />

        <CustomInput
          label="Branch Name"
          disabled={true}
          value={propDatas?.branch_name || ''}
          onChange={(e: any) => setBranchName(e.target.value)}
          icon={true}
          size="small"
        />
        <Dropdown
          required={true}
          displayEmpty={true}
          dataArray={branchArray}
          title="Migrate To"
          value={selectedBranch || ''}
          onChangeHandler={(val: any) => setselectedBranch(val)}
          sxClass={{
            width: '100%',
            '& fieldset': {
              border: '1px solid #e5e7eb'
            }
          }}
        />
      </div>
      <div className="mt-20 text-end">
        <Button
          disabled={!selectedBranch}
          onClick={onSubmit}
          loading={loading}
        >
          Add
        </Button>
      </div>
    </CustomizedDialogs>
  );
};

export default MigrateUser;
