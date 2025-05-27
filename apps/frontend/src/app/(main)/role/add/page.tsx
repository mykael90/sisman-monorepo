import RoleAdd from '../_components/add/role-add';

export default async function Page({
  isInDialog = false
}: {
  isInDialog?: boolean;
}) {
  // Roles don't seem to have relationships like users have with roles,
  // so no extra data fetching is needed here for the form itself.
  // If roles needed to select permissions, you would fetch them here.

  return <RoleAdd isInDialog={isInDialog} />;
}
