/* eslint-disable comma-dangle */
import Button from '@component/button/button';
import DebounceInput from '@component/input/DebounceInput';
import { useEffect, useState } from 'react';
import { set } from 'react-hook-form';

type SearchUserProps = {
  setSearchVal: any;
  isLoading: boolean;
  fetchData: any;
  searchVal: string;
};

export default function SearchUser({
  setSearchVal,
  isLoading,
  fetchData,
  searchVal,
}: SearchUserProps) {
  const [error, setError] = useState('');

  const handleSearch = () => {
    // if (setSearchVal.length < 2) {
    //   setError('Data searched must be at least 2 characters');
    // } else {
    //   setError('');
    // }
    fetchData();
  };

  useEffect(() => {
    if (searchVal === '') {
      setError('');
    }
  }, [searchVal]);

  return (
    <div className="w-full">
      <div className="bg-white rounded-md p-4">
        <div className="flex w-full justify-between">
          <div className="max-w-xs">
            <DebounceInput
              onChange={(value: string) => setSearchVal(value)}
              loading={isLoading}
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>
      <p>Search for user by username, email or first name.</p>
    </div>
  );
}
