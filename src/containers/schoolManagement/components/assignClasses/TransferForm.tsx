import Button from '@component/button/button';
import Dropdown from '@component/dropdown/Dropdown';

const TransferForm = (props:any) => {
  const { selectedBranch, branchArray, handleToolbarBranch, title } = props;
  return (
    <form>
      <div className="">
        <div className="flex flex-row font-semibold">
          <h4>{title}</h4>
          <h4 className="text-red-600 font-semibold mx-2">
            {' '}
            :
            Ryan Smith
          </h4>
        </div>
        <div className="flex flex-row justify-center m-5 width-100% ">
          <div className=" w-1/2 ">
            <Dropdown
              sxClass={{
                '& fieldset': {
                  border: '1px solid #D2D2D2'
                },
                width: '100%'
              }}
              title="Select Branch"
              value={selectedBranch}
              dataArray={branchArray}
              onChangeHandler={handleToolbarBranch}
            />
          </div>
          <div className="ml-2 w-1/2">
            <Dropdown
              sxClass={{
                '& fieldset': {
                  border: '1px solid #D2D2D2'
                },
                width: '100%'
              }}
              title="Select Branch to Transfer"
              value={selectedBranch}
              dataArray={branchArray}
              onChangeHandler={handleToolbarBranch}
            />
          </div>
        </div>
        <div className="flex flex-row m-5 justify-center  ">
          <div className=" w-1/2">
            <Dropdown
              sxClass={{
                '& fieldset': {
                  border: '1px solid #D2D2D2'
                },
                width: '100%'
              }}
              title="Select Class"
              value={selectedBranch}
              dataArray={branchArray}
              onChangeHandler={handleToolbarBranch}
            />
          </div>
          <div className="ml-2 w-1/2">
            <Dropdown
              sxClass={{
                '& fieldset': {
                  border: '1px solid #D2D2D2'
                },
                width: '100%'
              }}
              title="Select Class to Transfer"
              value={selectedBranch}
              dataArray={branchArray}
              onChangeHandler={handleToolbarBranch}
            />
          </div>
        </div>
        <div className="flex justify-end my-8">
          <Button size="medium" variant="contained">Transfer</Button>
        </div>
      </div>
    </form>
  );
};

export default TransferForm;
