import DebounceInput from '@component/input/DebounceInput';

export default function SearchUser({ setSearchVal, isLoading }: any) {
  return (
    <div className="w-full">
      <div className="bg-white rounded-md p-4">
        <div className="max-w-xs">
          <DebounceInput
            onChange={(value: string) => setSearchVal(value)}
            loading={isLoading}
          />
        </div>
      </div>
      <p>Search for user by username, email or first name.</p>
    </div>
  );
}
