import { ReactComponent as Translations } from '@images/AdminIcons/Ic_Translations.svg';
import { ReactComponent as LTI } from '@images/AdminIcons/Ic_LTI.svg';
import { ReactComponent as Admin } from '@images/AdminIcons/Ic_admin.svg';
import { ReactComponent as API } from '@images/AdminIcons/Ic_api.svg';
import { ReactComponent as Publishers } from '@images/AdminIcons/Ic_publishers.svg';
import { ReactComponent as GlobalSetting } from '@images/AdminIcons/Ic_globesetting.svg';
import { ReactComponent as ManageClasses } from '@images/smicons/Manage-classes.svg';
import { ReactComponent as ConfigSetting } from '@images/AdminIcons/Ic_config-setting.svg';
import { ReactComponent as ManageAdmin } from '@images/smicons/manageAdminn1.svg';

import { Link } from 'react-router-dom';
import { MANAGE_ADMIN } from '@constants/routes';
import RouteLayout from '../layout/routeLayout';

export default function Index() {
  return (
    <RouteLayout navBack={true}>
      <div className="sm-container">
        <div>
          <p className="mt-6 h-9 flex items-center text-lg font-semibold border-l-4 border-sunlight pl-2">
            Admin Panel
          </p>
        </div>
        <div className="card-container">
          <div className="cards">
            <Translations />

            <span>Translations</span>
          </div>
          <div className="cards">
            <LTI />
            <span>Manage LTI 1.0 Consumers</span>
          </div>
          <Link to={`${MANAGE_ADMIN}`} className="cards">
            <Admin />
            <span>Manage Admin</span>
          </Link>
          <div className="cards">
            <API />

            <span>OAuth2 API Clients</span>
          </div>
          <Link to="/publisher/course-code" className="cards">
            <Publishers />
            <span>Manage Publishers</span>
          </Link>

          <div className="cards">
            <GlobalSetting />

            <span>Global Setting</span>
          </div>
          <div className="cards">
            <ConfigSetting />
            <span>Configuration Type</span>
          </div>

          <Link to="course-icons" className="cards">
            <ManageClasses />

            <span>Course Icons</span>
          </Link>

          <Link to="manage-users" className="cards">
            <ManageAdmin />

            <span>Manage users</span>
          </Link>
        </div>
      </div>
    </RouteLayout>
  );
}
