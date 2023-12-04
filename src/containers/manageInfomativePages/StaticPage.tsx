import { useGet } from '@shared/api/useApi';
import { useParams } from 'react-router-dom';
import Loader from '@shared/loader';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RouteLayout from '@layout/routeLayout';

const StaticPage = () => {
  const { id = '' } = useParams();
  const baseURL = import.meta.env.VITE_APP_CMS_SERVICE_URL;

  const { isLoading: pageLoading, data: pageContent } = useGet({
    baseURL,
    url: `cms-service/page/${id}/`
  });

  const handleToolbarAction = async (title: string) => {
    if (title === 'Copy Static Page Link') {
      navigator.clipboard.writeText(`${baseURL}cms-service/page/${id}/render/`);
    }
  };

  const ADMIN_TOOLBAR_MENU = [
    {
      title: 'Copy Static Page Link',
      icon: <ContentCopyIcon />
    }
  ];

  if (pageLoading) {
    return (
      <div className="h-32">
        <Loader />
      </div>
    );
  }

  return (
    <RouteLayout navBack={true}>
      <HeaderMenus title={pageContent?.data?.response?.display_title} menuArray={ADMIN_TOOLBAR_MENU} handleToolbarAction={handleToolbarAction} />
      <div className="w-full p-4 bg-white mt-2">
        {/* eslint-disable-next-line react/no-danger */}
        <div dangerouslySetInnerHTML={{ __html: pageContent?.data?.response?.content }} />
      </div>
    </RouteLayout>
  );
};

export default StaticPage;
