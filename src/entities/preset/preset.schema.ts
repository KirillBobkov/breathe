/**
 * Zod validation schemas for Preset entities
 * Provides runtime type validation for preset data
 */

import { z } from 'zod';
import type { Preset } from './preset.types';

/**
 * Validation result type for preset data
 * Uses a custom result type with error details
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; issues: z.ZodIssue[] };

/**
 * Time unit for phase duration
 */
export const timeUnitSchema = z.enum(['seconds', 'minutes']);

/**
 * Phase validation schema
 */
export const phaseSchema = z.object({
  id: z.string().min(1, 'Phase ID cannot be empty'),
  name: z.string().min(1, 'Phase name cannot be empty'),
  duration: z.number().positive('Duration must be positive'),
  unit: timeUnitSchema,
});

/**
 * Preset validation schema
 */
export const presetSchema = z.object({
  id: z.string().min(1, 'Preset ID cannot be empty'),
  name: z.string().min(1, 'Preset name cannot be empty').max(100, 'Preset name too long'),
  phases: z
    .array(phaseSchema)
    .min(1, 'Preset must have at least one phase')
    .max(20, 'Preset cannot have more than 20 phases'),
  totalCycles: z.number().positive().int().optional(),
  description: z.string().max(500, 'Description too long').optional(),
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

/**
 * Preset create input validation schema
 */
export const presetCreateInputSchema = z.object({
  name: z.string().min(1, 'Preset name cannot be empty').max(100, 'Preset name too long'),
  phases: z
    .array(
      z.object({
        name: z.string().min(1, 'Phase name cannot be empty'),
        duration: z.number().positive('Duration must be positive'),
        unit: timeUnitSchema,
      })
    )
    .min(1, 'Preset must have at least one phase')
    .max(20, 'Preset cannot have more than 20 phases'),
  totalCycles: z.number().positive().int().optional(),
  description: z.string().max(500, 'Description too long').optional(),
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
});

/**
 * Preset update input validation schema
 */
export const presetUpdateInputSchema = z.object({
  name: z.string().min(1, 'Preset name cannot be empty').max(100, 'Preset name too long').optional(),
  phases: z.array(phaseSchema).min(1).max(20).optional(),
  totalCycles: z.number().positive().int().optional(),
  description: z.string().max(500, 'Description too long').optional(),
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
});

/**
 * Preset array validation schema
 * Used to validate the entire presets array from storage
 */
export const presetArraySchema = z.array(presetSchema);

/**
 * Type inference from schemas
 * Note: TimeUnit is imported from preset.types.ts to avoid duplication
 */
export type PhaseSchema = z.infer<typeof phaseSchema>;
export type PresetSchema = z.infer<typeof presetSchema>;
export type PresetCreateInputSchema = z.infer<typeof presetCreateInputSchema>;
export type PresetUpdateInputSchema = z.infer<typeof presetUpdateInputSchema>;

/**
 * Validation error formatter
 * Formats Zod errors into a readable string
 */
export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((e) => {
      const path = e.path.length > 0 ? e.path.join('.') : 'root';
      return `${path}: ${e.message}`;
    })
    .join(', ');
}

/**
 * Safely parse preset data with detailed error reporting
 * @returns Validation result with validated preset or error details
 */
export function validatePreset(data: unknown): ValidationResult<Preset> {
  const result = presetSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: formatZodError(result.error),
    issues: result.error.issues,
  };
}

/**
 * Safely parse preset array data with detailed error reporting
 * @returns Validation result with validated preset array or error details
 */
export function validatePresetArray(data: unknown): ValidationResult<Preset[]> {
  const result = presetArraySchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: formatZodError(result.error),
    issues: result.error.issues,
  };
}
