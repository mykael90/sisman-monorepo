import { z } from 'zod';

// Base schema for Role properties, derived from role.dto.ts and role-form-validation.ts
export const roleBaseSchema = z.object({
  id: z.number().optional(), // ID is optional for creation, but present for existing roles
  role: z
    .string()
    .min(3, 'O nome do papel deve ter pelo menos 3 caracteres')
    .regex(
      /^[A-Z_]+$/,
      'O nome do papel deve conter apenas letras maiúsculas e underscores (ex: ADMIN_USER)'
    ),
  description: z
    .string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres'),
  createdAt: z.string().datetime().optional(), // Dates are usually strings from API, or can be z.date() if transformed
  updatedAt: z.string().datetime().optional()
});

// Schema for adding a new role (equivalent to CreateRoleDto)
export const roleFormSchemaAdd = roleBaseSchema.extend({
  id: z.number().optional() // Explicitly optional for creation
});

// Schema for editing an existing role (equivalent to UpdateRoleDto)
export const roleFormSchemaEdit = roleBaseSchema.extend({
  id: z.number().positive('ID inválido') // ID is required and positive for editing
}).partial(); // All fields are optional for update, except ID which is extended as required

// Schema for a full Role object with relations (for listing)
// This will include the 'users' relation, which will be an array of simplified user schemas
export const roleWithUsersSchema = roleBaseSchema.extend({
  id: z.number(), // ID is always present in a listed role
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // Users relation - for listing, we might only need id, name, email
  users: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email()
    })
  ).optional() // Users might not always be included in every list query
});


// Infer types from schemas
export type RoleFormSchemaAdd = z.infer<typeof roleFormSchemaAdd>;
export type RoleFormSchemaEdit = z.infer<typeof roleFormSchemaEdit>;
export type RoleWithUsers = z.infer<typeof roleWithUsersSchema>;
export type RoleBase = z.infer<typeof roleBaseSchema>; // Export base type for general use
