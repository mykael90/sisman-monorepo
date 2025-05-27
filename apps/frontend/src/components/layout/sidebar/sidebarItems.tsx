import {
  Home,
  BookOpen,
  Package,
  PackageOpen,
  Users,
  Drill,
  Building2,
  Truck,
  Store,
  Settings,
  Construction,
  PackagePlus
} from 'lucide-react';

export interface SidebarItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: SidebarItem[];
}

export const DIVIDER_LABEL = '---';

export const sidebarItems: SidebarItem[] = [
  {
    label: 'Início',
    href: '/',
    icon: <Home className='h-6 w-6' />
  },
  {
    label: 'Infraestrutura',
    icon: <Building2 className='h-6 w-6' />,
    children: [
      { label: 'Todas as Infraestruturas', href: '/infrastructure/all' },
      { label: 'Adicionar Infraestrutura', href: '/infrastructure/add' },
      { label: DIVIDER_LABEL }, // Divider here
      {
        label: 'Tipos',
        children: [
          { label: 'Todos os Tipos', href: '/infrastructure/types/all' },
          { label: 'Adicionar Tipo', href: '/infrastructure/types/add' }
        ]
      }
    ]
  },
  {
    label: 'Manutenção',
    href: '/maintenance', //Optional, could be omitted if you don't want a direct link to Materiais
    icon: <Construction className='h-6 w-6' />,
    children: [
      { label: 'Todos os Materiais', href: '/maintenance/all' },
      { label: 'Adicionar Material', href: '/maintenance/add' },
      { label: 'Categorias', href: '/maintenance/category' }
    ]
  },
  {
    label: 'Colaboradores',
    icon: <Users className='h-6 w-6' />,
    children: [
      { label: 'Todos os Colaboradores', href: '/collaborators/all' },
      { label: 'Adicionar Colaborador', href: '/collaborators/add' },
      { label: 'Cargos', href: '/collaborators/roles' }
    ]
  },
  {
    label: 'Materiais Novos',
    href: '/material', //Optional, could be omitted if you don't want a direct link to Materiais
    icon: <Package className='h-6 w-6' />,
    children: [
      { label: 'Todos os Materiais', href: '/material/all' },
      { label: 'Adicionar Material', href: '/material/add' },
      { label: 'Categorias', href: '/material/category' }
    ]
  },
  {
    label: 'Materiais Usados',
    href: '/material-used', //Optional, could be omitted if you don't want a direct link to Materiais
    icon: <PackageOpen className='h-6 w-6' />,
    children: [
      { label: 'Todos os Materiais', href: '/material/all' },
      { label: 'Adicionar Material', href: '/material/add' },
      { label: 'Categorias', href: '/material/category' }
    ]
  },
  {
    label: 'Materiais Beneficiados',
    href: '/material-processed', //Optional, could be omitted if you don't want a direct link to Materiais
    icon: <PackagePlus className='h-6 w-6' />,
    children: [
      { label: 'Todos os Materiais', href: '/material/all' },
      { label: 'Adicionar Material', href: '/material/add' },
      { label: 'Categorias', href: '/material/category' }
    ]
  },
  {
    label: 'Equipamentos',
    icon: <Drill className='h-6 w-6' />,
    children: [
      { label: 'Todos os Equipamentos', href: '/equipment/all' },
      { label: 'Adicionar Equipamento', href: '/equipment/add' },
      { label: 'Tipos', href: '/equipment/types' }
    ]
  },
  {
    label: 'Fornecedores',
    icon: <Store className='h-6 w-6' />,
    children: [
      { label: 'Todos os Fornecedores', href: '/suppliers/all' },
      { label: 'Adicionar Fornecedor', href: '/suppliers/add' },
      { label: 'Categorias', href: '/suppliers/category' }
    ]
  },
  {
    label: 'Frota',
    icon: <Truck className='h-6 w-6' />,
    children: [
      { label: 'Todos os Veículos', href: '/fleet/all' },
      { label: 'Adicionar Veículo', href: '/fleet/add' },
      { label: 'Tipos', href: '/fleet/types' }
    ]
  },
  {
    label: 'Settings',
    icon: <Settings className='h-6 w-6' />,
    children: [
      { label: 'Usuários', href: '/user' },
      { label: 'Tipos de Permissões', href: '/role' }
    ]
  },
  {
    label: 'Sobre',
    href: '/about',
    icon: <BookOpen className='h-6 w-6' />
  }
];
