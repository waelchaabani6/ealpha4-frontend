import Tooltip from '@mui/material/Tooltip';
import PageTitle from '@shared/pageTitle';
import { HEADERMENUS } from '@constants/constants';
import Button, { IconButton } from '../../components/button/button';

type HeaderMenus = {
  title: string;
  subtitle?: string | undefined;
  subtitle2?: string | undefined;
  menuArray?: any;
  handleToolbarAction?: (e: any) => void;
};

export function HeaderMenus(props: HeaderMenus): JSX.Element {
  const { title, menuArray, handleToolbarAction } = props;
  return (
    <div className="flex lg:justify-between items-center mt-4 text-xs">
      <PageTitle title={title} subtitle={props?.subtitle} subtitle2={props?.subtitle2} />
      <div className="utilityMenu flex gap-2 pr-2 lg:p-0">
        {
          menuArray?.map((item: any): any => (
            <Tooltip key={item?.title} title={item?.title} placement="top" arrow={true}>
              {
              item.type === HEADERMENUS.BUTTON
                ? <Button onClick={() => {
                  if (handleToolbarAction) {
                    handleToolbarAction(item?.title);
                  }
                }}>
                  {' '}
                  {item?.title}
                  {' '}
                  {/* eslint-disable-next-line react/jsx-closing-tag-location  */}
                </Button>
                : <div
                    role="presentation"
                    onClick={() => {
                      if (handleToolbarAction) {
                        handleToolbarAction(item?.title);
                      }
                    }}
                >
                  <IconButton sx={{ boxShadow: 'none' }}>
                    {item?.icon}
                  </IconButton>
                  {/* eslint-disable-next-line react/jsx-closing-tag-location  */}
                </div>
              }
            </Tooltip>
          ))
        }
      </div>
    </div>
  );
}

export default HeaderMenus;
