import { commonRoutes } from "@routes/superAdminRoutes/schoolManagementRoutes";
import React from "react";

const ManageClasses = React.lazy(
  () => import("@containers/schoolManagement/components/panels/classes"),
);
const StudentPromote = React.lazy(
  () =>
    import("@containers/schoolManagement/components/promote/StudentPromote"),
);
const AssignClasses = React.lazy(
  () => import("@containers/schoolManagement/components/assignClasses"),
);
const ImportMember = React.lazy(
  () =>
    import(
      "@containers/schoolManagement/components/panels/members/importMember/ImportMember"
    ),
);

export default {
  path: ":id",
  children: [
    {
      path: "manage-members",
      children: commonRoutes,
    },
    { path: "bulk-upload/:moduleName", element: <ImportMember /> },
    {
      path: "manage-classes",
      children: [
        { index: true, element: <ManageClasses /> },
        { path: "assign-classes/:classID", element: <AssignClasses /> },
      ],
    },
    { path: "promote-student", element: <StudentPromote /> },
  ],
};
