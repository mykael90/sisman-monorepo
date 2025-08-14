import { MaintenanceRequestEdit } from '../../../_components/edit/maintenance-request-edit';

export default function EditModal({ params }: { params: { id: string } }) {
  return <MaintenanceRequestEdit id={parseInt(params.id)} />;
}
