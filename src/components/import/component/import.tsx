import PageTitle from '@shared/pageTitle';
import FileSelect from '@component/fileUpload';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { ReactComponent as Download } from '@images/importScv/rect823.svg';
import { ReactComponent as Pointer } from '@images/importScv/Ellipse 546.svg';
import { TOOLBAR_LABELS } from '@constants/constants';
import { usePost } from '@shared/api/useApi';
import { useNavigate, useParams } from 'react-router-dom';
import toast from '@shared/toast';
import { useSelector } from 'react-redux';
import { selectSchoolData } from '@shared/store/schoolSlice';
import NotFound from '@shared/notFound';
import SimpleBackdrop from '@component/Backdrop';
import { capitalizeFirstLetter } from '@utility/utility';
import { IconButton } from '../../button/button';

const data = ['CSV file only supported, should contain header line', 'Sequence data in the row : login, password, role, secondname, name, email, class, gender, birthdate', 'File has to be UTF-8 encoded', 'Username can not have special characters', 'Gender can be "Male" or "Female". Birth date have to be in format: MM-DD-YY'];
export default function Import() {
  const navigate = useNavigate();
  const { id, branchId, userID, moduleName } = useParams();
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const TEACHER = 'Teacher';
  const STUDENT = 'Student';
  const PARENT = 'Parent';
  const pageTitle = {
    teacher: TEACHER,
    student: STUDENT,
    parent: PARENT
  } as any;
  const imageRef = useRef<any>();
  // const { setValue, watch } = useFormContext();
  const onChange = (files: FileList) => {
    const file = files?.[0];
    const fileType = file.name.split('.').pop();
    if (fileType === 'csv') {
      const documentFormData: any = new FormData();
      documentFormData.append('file_name', file);
      documentFormData.append('import_type', moduleName || '');
      documentFormData.append('school_id', id || branchData?.school_data?.id || '');
      if (branchId) {
        documentFormData.append('branch_id', branchId || '');
      }
      if (moduleName
        && (moduleName === `${TEACHER.toLowerCase()}`
          || moduleName === `${STUDENT.toLowerCase()}`
          || moduleName === `${PARENT.toLowerCase()}`)
      ) {
        mutateImport(documentFormData);
      }
    } else {
      toast('error', 'Please upload CSV filetype only');
    }
  };
  //   http://44.197.78.213:8000/api/v1/master-service/csv-template/?csv_type=student

  // csv_type:
  //     -   student
  //     -   teacher
  //     -   parent
  const url = `${import.meta.env.VITE_APP_MASTER_SERVICE_URL}master-service/csv-template/?csv_type=${moduleName}`;
  // const options = {
  //   Accept: 'application/json',
  //   'Content-Type': 'application/json'
  // };
  const downloadFile = async () => {
    // const image = await fetch(url);
    // const imgBlob = await image.blob();
    // const fileURL = URL.createObjectURL(imgBlob);

    const alink = document.createElement('a');
    alink.href = url;
    // alink.download = `student.jpg`;
    document.body.appendChild(alink);
    alink.click();
    // document.body.removeChild(alink);
  };

  // const importData = async () => {
  //   const input: any = document.createElement('input');
  //   input.type = 'file';
  //   input.accept = '.csv';
  //   input.onchange = () => {
  //     const file = input?.files?.[0];
  //     const fileType = file.name.split('.').pop();
  //     if (fileType === 'csv') {
  //       const documentFormData: any = new FormData();
  //       documentFormData.append('csv_file', file);
  //       // documentFormData.append('import_type', 'sub-admin');
  //       documentFormData.append('school_id', id || branchData?.school_data?.id);
  //       documentFormData.append('branch_id', branchId || branchData?.id);
  //       if (moduleName
  //         && (moduleName === `${TEACHER.toLowerCase()}s`
  //           || moduleName === `${STUDENT.toLowerCase()}s`
  //           || moduleName === `${PARENT.toLowerCase()}s`)
  //       ) {
  //         mutateImport(documentFormData);
  //       }
  //     } else {
  //       toast('error', 'Please upload CSV filetype only');
  //     }
  //   };
  //   input.click();
  // };

  // ---------------------API-------------
  // Import CSV for Teacher
  const { isLoading, mutate: mutateImport } = usePost({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/${moduleName}s/csv-upload`,
    onSuccess: (response: any) => {
      const res = response?.data?.message;
      toast('success', res);
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    }
  });
  // ---------------------END API--------------------------
  return (
    <div className="h-full w-full flex flex-col">
      {/* <a href="https://ealpha-dev.s3.amazonaws.com/sparky.jpg" download="image">link</a> */}
      <div className="px-6 py-8">
        <PageTitle title={pageTitle[moduleName || 'teacher']} />
        <div className="width-100% flex flex-row gap-5 mt-8">
          <div className="px-[100px] py-[10px] border-solid border-2 border-green-600 ">
            <div className="flex justify-center max-w-full mt-5 cursor-pointer" role="presentation" onClick={() => downloadFile()}>
              {/* <IconButton> */}
              <Download />
              {/* </IconButton> */}
            </div>
            <small className="flex justify-center text-green-600">Download Sample Templates</small>
          </div>

          <div className="grow">
            {/* <h4 className="font-semibold">Upload Document</h4> */}
            <div className="">
              <FileSelect
                ref={imageRef}
                onChange={onChange}
              />
            </div>
          </div>
        </div>
        <div className="mt-8 p-5 border border-[#D2D2D2]-600  rounded m-1 bg-slate-100 mb-20 ">
          <h4 className="font-semibold my-5">Import Information </h4>
          {
            data.map((item, index) => (
              <div className="flex flex-row font-sans" key={index}>
                <span className="p-3"><Pointer /></span>
                {' '}
                <small className="p-1">{item}</small>
              </div>
            ))
          }
        </div>
        <SimpleBackdrop
          open={isLoading}
        />
      </div>
    </div>
  );
}
