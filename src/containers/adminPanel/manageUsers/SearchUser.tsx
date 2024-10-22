/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable comma-dangle */
import { useEffect, useState } from 'react';

import Button from '@component/button/button';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CustomSearchInput from '@component/input/CustomSearchInput';
import { useForm } from 'react-hook-form';

type SearchUserProps = {
  setSearchVal: any;
  isLoading: boolean;
  fetchData: any;
  searchVal: string;
  setPage: React.Dispatch<React.SetStateAction<number>>;
};

export default function SearchUser({
  setSearchVal,
  isLoading,
  fetchData,
  searchVal,
  setPage,
}: SearchUserProps) {
  const [error, setError] = useState('');

  const handleSearch = () => {
    if (searchVal.length < 2) {
      setError('Data searched must be at least 2 characters');
    } else {
      setError('');
      setPage(1);
      fetchData();
    }
  };

  const handleReset = () => {
    reset();
    setSearchVal(() => '');
    setError('');
    setPage(1);

    setTimeout(() => {
      fetchData();
    }, 500);
  };

  useEffect(() => {
    if (searchVal === '') {
      setError('');
    }
  }, [searchVal]);

  const { control, watch, reset } = useForm();

  useEffect(() => {
    setSearchVal(watch('search'));
  }, [watch('search')]);

  return (
    <div className="w-full">
      <div className="bg-white rounded-md p-4">
        <div className="flex w-full gap-x-5 items-baseline">
          <div className="max-w-xs min-w-[70%]">
            <CustomSearchInput
              control={control}
              name="search"
              loading={isLoading}
            />
          </div>

          <Button
            sx={{
              width: '400px',
            }}
            onClick={handleSearch}
          >
            Search
          </Button>

          <span
            tabIndex={0}
            title="Clear Search"
            onClick={handleReset}
            role="button"
          >
            <RestartAltIcon />
          </span>
        </div>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>
      <p>Search for user by username, email or first name.</p>
    </div>
  );
}
