import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import FolderIcon from '@mui/icons-material/Folder';
import { useNavigate, useParams } from 'react-router-dom';
import RouteLayout from '../layout/routeLayout';

type FolderProps = { folderName: string; schoolName: string };

export default function DigitalLib() {
  const MyFiles = ['My Files', 'Shared Files', 'Received Files'];
  const { schoolName } = useParams();

  return (
    <RouteLayout
      navBack={true}
    >
      <HeaderMenus
        title="My Library"
        menuArray={[]}
      />
      <div className="flex flex-row mt-4">
        {MyFiles.map((ele: string) => (
          <Folder folderName={ele} schoolName={schoolName || ''} />
        ))}
      </div>
    </RouteLayout>
  );
}

const Folder = ({ folderName, schoolName }: FolderProps) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center m-2 w-15 cursor-pointer">
      <FolderIcon sx={{ fontSize: '4rem', color: 'orange' }} onClick={() => navigate(`/${schoolName}/digital-library/${folderName}`)} />
      {' '}
      {folderName}
      {' '}
    </div>
  );
};
