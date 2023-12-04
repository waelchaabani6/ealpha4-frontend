import Button from '@component/button/button';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import { CustomInput } from '@component/input';
import { usePost } from '@shared/api/useApi';
import toast from '@shared/toast';
import { useEffect, useState } from 'react';

const RemoveBranchPopup = (props: any) => {
  const {
    propDatas,
    deleteDialog,
    setDeleteDialog,
    title,
    setMigrateDialog,
    refetch,
    setRemovedBranchObject
  } = props;

  const [schoolName, setSchoolName] = useState('');
  const [branchName, setBranchName] = useState('');

  // Direct Delete Branch
  const { isLoading: DeleteBranchLoader, mutate: mutateBranch } = usePost({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/branch/migrate-remove/`,
    onSuccess: (response: any) => {
      refetch();
      setDeleteDialog(false);
      toast('success', response?.data?.message || 'Branch deleted successfully');
      if (setRemovedBranchObject) {
        setRemovedBranchObject({
          school_id: propDatas?.school_id,
          current_branch_id: propDatas?.id
        });
      }
    },
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Error');
    }
  });

  useEffect(() => {
    if (propDatas && Object.keys(propDatas).length) {
      setSchoolName(propDatas?.school_data?.name || propDatas?.school_name);
      setBranchName(propDatas?.branch_name);
    }
  }, [propDatas]);

  const handleRemoveBranch = () => {
    const payload = {
      school_id: propDatas?.school_id,
      current_branch_id: propDatas?.id,
      remove_branch: true
    };
    if (setRemovedBranchObject) {
      setRemovedBranchObject(null);
    }
    mutateBranch(payload);
  };

  return (
    <CustomizedDialogs title={title} open={deleteDialog} setOpen={setDeleteDialog}>
      <div className="flex sm:flex-row flex-col gap-8">
        <CustomInput
          label="School Name"
          value={schoolName}
          onChange={(e: any) => setSchoolName(e.target.value)}
          icon={true}
          size="small"
          disabled={true}
        />

        <CustomInput
          label="Branch Name"
          value={branchName}
          onChange={(e: any) => setBranchName(e.target.value)}
          icon={true}
          size="small"
          disabled={true}
        />
      </div>

      <h3 className="font-semibold text-base mt-[80px] mb-[10px]">Are you sure you want to Remove the Branch ?</h3>
      <p
        className="text-sm"
        style={{ color: 'var(--red)' }}
      >
        Before removing, all the user data must be transferred to another branch.
      </p>
      <div className="mt-20 text-end">
        <Button
          className="sm:w-fit w-full font-semibold"
          sx={{ margin: '10px' }}
          onClick={handleRemoveBranch}
          variant="outlined"
          loading={DeleteBranchLoader}
        >
          Remove Anyway
        </Button>
        <Button
          sx={{ margin: '10px' }}
          className="sm:w-fit w-full"
          onClick={() => {
            setMigrateDialog(true);
            setDeleteDialog(false);
          }}
          loading={false}
        >
          Migrate & Remove
        </Button>
      </div>
    </CustomizedDialogs>
  );
};

export default RemoveBranchPopup;
