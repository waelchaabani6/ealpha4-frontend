/* eslint-disable react/no-unused-prop-types */
/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-empty-interface */
import React from 'react';
import { ReactComponent as Book } from '@images/book.svg';
import { useNavigate } from 'react-router-dom';

interface Props {
    ImgRes: any;
}

function Preview ({ ImgRes }: Props) {
  const navigate = useNavigate();

  const navigatTolist = (id: number) => {
    navigate(`/manage-courses/upload-course/preview/${id}`);
  };

  return (
    <div className="p-cards cursor-pointer" role="presentation" onClick={() => navigatTolist(ImgRes?.id)}>
      <div className="h-[232px]">
        {
        (ImgRes?.image || ImgRes?.logo) ? <img className="h-[230px]" src={ImgRes?.image || ImgRes?.logo} alt={ImgRes?.name} /> : <Book height={224} width={226} />
        }
      </div>
      <div className="p-cards-lower">
        <h1 className="p-4">
          {ImgRes?.name}
        </h1>
      </div>
    </div>
  );
}

export default Preview;
