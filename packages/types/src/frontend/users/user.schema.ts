import { z } from 'zod';
import { roleWithUsersSchema } from '../roles/role.schema';

// Base schema for User properties, derived from user.dto.ts and user-form-validation.ts
// This schema will be used for both creation and update, with optionality handled by .partial() or .optional()
export const userBaseSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  login: z
    .string()
    .regex(/\./, 'Login must contain a dot (.)')
    .min(3, 'Login must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  image: z.string().url('Invalid URL for image').optional().or(z.literal('')),
  isActive: z.boolean().optional() // isActive is optional for creation, but present for edit
});

// Schema for creating a new user (equivalent to CreateUserDto)
export const userFormSchemaAdd = userBaseSchema.extend({
  // Roles are required for creation, but can be an empty array
  roles: z
    .array(
      z.object({
        id: z.number().min(1, 'Role ID cannot be empty.')
      })
    )
    .min(0, 'roles can be empty')
});

// Schema for editing an existing user (equivalent to UpdateUserDto)
export const userFormSchemaEdit = userBaseSchema.extend({
  id: z.number().min(1, 'ID is required for editing.'),
  isActive: z.boolean() // isActive is explicitly required for editing
}).partial(); // All fields are optional for update, except ID which is extended as required

// Schema for a full User object with relations (for listing)
export const userWithRolesSchema = userBaseSchema.extend({
  id: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  roles: z.array(roleWithUsersSchema).optional() // Array of roles, optional for listing
});

// Infer types from schemas
export type UserFormSchemaAdd = z.infer<typeof userFormSchemaAdd>;
export type UserFormSchemaEdit = z.infer<typeof userFormSchemaEdit>;
export type UserWithRoles = z.infer<typeof userWithRolesSchema>;
export type UserBase = z.infer<typeof userBaseSchema>; // Export base type for general use

