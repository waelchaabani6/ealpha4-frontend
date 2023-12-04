import Button from '@component/button/button';
import Checkbox from '@component/checkbox';

export default function Questions(props: any) {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 content-center gap-y-3 md:gap-x-6 overflow-auto rounded-md border border-accent p-5">
      <div className="flex justify-between bg-sandgray rounded-md place-items-center rounded border-[#222222] border-2 border-dashed p-6">
        <div>
          Welcome Screen
          {' '}
          <span className="font-bold">(Customize)</span>
        </div>
        <div>
          <Checkbox />
          <span className="ml-1">Enable</span>
        </div>
      </div>
      <div className="flex justify-between bg-sandgray rounded-md place-items-center rounded border-[#222222] border-2 border-dashed p-6">
        <div>
          Exit Screen
          {' '}
          <span className="font-bold">(Customize)</span>
        </div>
        <div>
          <Checkbox />
          <span className="ml-1">Enable</span>
        </div>
      </div>
      <div className="py-8 space-x-5">
        <Button
          variant="outlined"
        >
          Find Questions
        </Button>
        <Button>
          Create Questions
        </Button>
      </div>
    </div>
  );
}
