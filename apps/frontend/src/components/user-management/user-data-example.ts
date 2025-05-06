import { UserWithRoles, UserWithRoles1, UserWithAll, UserWithSelectedFieldsAndRoles } from '../../../types/user';

// Dados de exemplo
const initialUsers: UserWithRoles1[] = [
  {
    id: 1,
    name: 'Sarah Connor',
    login: 'sarah.connor',
    email: 'sarah.connor@example.com',
    userRoles: [
      {
        "userRoletypeId": 202
      },
      {
        "userRoletypeId": 302
      },
      {
        "userRoletypeId": 402
      }
    ],
    isActive: true,
    image: '/placeholder.svg?height=40&width=40',
  },
  {
    id: 2,
    name: 'John Smith',
    login: 'john.smith',
    email: 'john.smith@example.com',
    userRoles: [
      {
        "userRoletypeId": 201
      },
      {
        "userRoletypeId": 301
      },
      { "userRoletypeId": 401 }
    ],
    isActive: true,
    image: '/placeholder.svg?height=40&width=40'
  },
  {
    id: 3,
    name: 'Emma Wilson',
    login: 'emma.wilson',
    email: 'emma.wilson@example.com',
    userRoles: [
      {
        "userRoletypeId": 203
      },
      {
        "userRoletypeId": 303
      },
      { "userRoletypeId": 403 }
    ],
    isActive: true,
    image: '/placeholder.svg?height=40&width=40'
  },
  {
    id: 4,
    name: 'Michael Johnson',
    login: 'michael.johnson',
    email: 'michael.johnson@example.com',
    userRoles: [
      {
        "userRoletypeId": 204
      },
      {
        "userRoletypeId": 304
      },
      { "userRoletypeId": 404 }
    ],
    isActive: true,
    image: '/placeholder.svg?height=40&width=40'
  },
  {
    id: 5,
    name: 'Olivia Brown',
    login: 'olivia.brown',
    email: 'olivia.brown@example.com',
    userRoles: [
      {
        "userRoletypeId": 201
      },
      {
        "userRoletypeId": 301
      },
      { "userRoletypeId": 401 }
    ],
    isActive: true,
    image: '/placeholder.svg?height=40&width=40'
  },
  {
    id: 6,
    name: 'William Davis',
    login: 'william.davis',
    email: 'william.davis@example.com',
    userRoles: [
      {
        "userRoletypeId": 203
      },
      {
        "userRoletypeId": 303
      },
      { "userRoletypeId": 403 }
    ],
    isActive: true,
    image: '/placeholder.svg?height=40&width=40'
  },
  {
    id: 7,
    name: 'Ava Garcia',
    login: 'ava.garcia',
    email: 'ava.garcia@example.com',
    userRoles: [
      {
        "userRoletypeId": 204
      },
      {
        "userRoletypeId": 304
      },
      { "userRoletypeId": 404 }
    ],
    isActive: true,
    image: '/placeholder.svg?height=40&width=40'
  },
  {
    id: 8,
    name: 'James Rodriguez',
    login: 'james.rodriguez',
    email: 'james.rodriguez@example.com',
    userRoles: [
      {
        "userRoletypeId": 201
      },
      {
        "userRoletypeId": 301
      },
      { "userRoletypeId": 401 }
    ],
    isActive: true,
    image: '/placeholder.svg?height=40&width=40'
  },
  {
    id: 9,
    name: 'Sophia Martinez',
    login: 'sophia.martinez',
    email: 'sophia.martinez@example.com',
    userRoles: [
      {
        "userRoletypeId": 203
      },
      {
        "userRoletypeId": 303
      },
      { "userRoletypeId": 403 }
    ],
    isActive: true,
    image: '/placeholder.svg?height=40&width=40'
  },
  {
    id: 10,
    name: 'Benjamin Hernandez',
    login: 'benjamin.hernandez',
    email: 'benjamin.hernandez@example.com',
    userRoles: [
      {
        "userRoletypeId": 204
      },
      {
        "userRoletypeId": 304
      },
      { "userRoletypeId": 404 }
    ],
    isActive: true,
    image: '/placeholder.svg?height=40&width=40'
  },
  {
    id: 11,
    name: 'Isabella Lopez',
    login: 'isabella.lopez',
    email: 'isabella.lopez@example.com',
    userRoles: [
      {
        "userRoletypeId": 201
      },
      {
        "userRoletypeId": 301
      },
      { "userRoletypeId": 401 }
    ],
    isActive: true,
    image: '/placeholder.svg?height=40&width=40'
  },
  {
    id: 12,
    name: 'Ethan Gonzalez',
    login: 'ethan.gonzalez',
    email: 'ethan.gonzalez@example.com',
    userRoles: [
      {
        "userRoletypeId": 203
      },
      {
        "userRoletypeId": 303
      },
      { "userRoletypeId": 403 }
    ],
    isActive: true,
    image: '/placeholder.svg?height=40&width=40'
  },
  {
    id: 13,
    name: 'Mia Wilson',
    login: 'mia.wilson',
    email: 'mia.wilson@example.com',
    userRoles: [
      {
        "userRoletypeId": 204
      },
      {
        "userRoletypeId": 304
      },
      { "userRoletypeId": 404 }
    ],
    isActive: true,
    image: '/placeholder.svg?height=40&width=40'
  },
  {
    id: 14,
    name: 'Alexander Perez',
    login: 'alexander.perez',
    email: 'alexander.perez@example.com',
    userRoles: [
      {
        "userRoletypeId": 201
      },
      {
        "userRoletypeId": 301
      },
      { "userRoletypeId": 401 }
    ],
    isActive: true,
    image: '/placeholder.svg?height=40&width=40'
  }
];

export default initialUsers;
