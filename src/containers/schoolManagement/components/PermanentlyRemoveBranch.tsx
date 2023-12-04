import CustomizedDialogs from '@component/dialog/CustomDialog';
import { CustomInput } from '@component/input';
import Button from '@component/button/button';

const PermanentlyRemoveBranch = (props: any) => {
  const {
    permanentyRemoveDialog,
    setPermanentyRemoveDialog,
    title,
    handleLicenseSubmit,
    schoolName,
    setSchoolName,
    branchName,
    setBranchName
  } = props;
  return (
    <CustomizedDialogs title={title} open={permanentyRemoveDialog} setOpen={setPermanentyRemoveDialog}>
      <div className="flex flex-col gap-8">
        <CustomInput
          label="School Name"
          value={schoolName}
          onChange={(e: any) => setSchoolName(e.target.value)}
          icon={true}
          size="small"
        />

        <CustomInput
          label="Branch Name"
          value={branchName}
          onChange={(e: any) => setBranchName(e.target.value)}
          icon={true}
          size="small"
        />
      </div>
      <p
        className="text-sm mt-5"
        style={{ color: 'var(--red)' }}
      >
        Removed data is temporarily Archived.
      </p>
      <div className="mt-20 text-end">
        <Button
          onClick={handleLicenseSubmit}
          loading={false}
        >
          Add
        </Button>
      </div>
    </CustomizedDialogs>
  );
};

export default PermanentlyRemoveBranch;
