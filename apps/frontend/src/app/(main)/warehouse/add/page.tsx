import { WarehouseAdd } from '../_components/add/warehouse-add';

export default function Page({ isInDialog = false }: { isInDialog?: boolean }) {
  return <WarehouseAdd isInDialog={isInDialog} />;
}
