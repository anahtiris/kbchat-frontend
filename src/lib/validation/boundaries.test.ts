import { describe, it, expect } from 'vitest';
import { validateBoundaries } from './boundaries';
import { RagBoundary } from '@/lib/types';

describe('validateBoundaries', () => {
    // Helper to create a boundary
    const createBoundary = (start: number, end: number, type: 'include' | 'exclude' = 'include'): RagBoundary => ({
        type,
        pageStart: start,
        pageEnd: end
    });

    it('should pass for a single valid range', () => {
        const result = validateBoundaries([createBoundary(1, 10)], 20);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should pass for multiple non-overlapping ranges', () => {
        const boundaries = [
            createBoundary(1, 5),
            createBoundary(7, 10)
        ];
        const result = validateBoundaries(boundaries, 20);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should fail if start page is less than 1', () => {
        const result = validateBoundaries([createBoundary(0, 5)], 20);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(expect.objectContaining({
            field: 'pageStart',
            message: 'Page must be at least 1'
        }));
    });

    it('should fail if end page exceeds total pages', () => {
        const result = validateBoundaries([createBoundary(1, 25)], 20);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(expect.objectContaining({
            field: 'pageEnd',
            message: 'Page cannot exceed 20'
        }));
    });

    it('should fail if start page is greater than end page', () => {
        const result = validateBoundaries([createBoundary(10, 5)], 20);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(expect.objectContaining({
            field: 'pageStart',
            message: 'Start page must be before end page'
        }));
    });

    it('should allow single page ranges (start === end)', () => {
        const result = validateBoundaries([createBoundary(5, 5)], 20);
        expect(result.isValid).toBe(true);
    });

    it('should fail for overlapping ranges (partial overlap)', () => {
        const boundaries = [
            createBoundary(1, 5),
            createBoundary(4, 8)
        ];
        const result = validateBoundaries(boundaries, 20);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.message.includes('Overlaps'))).toBe(true);
    });

    it('should fail for overlapping ranges (subset)', () => {
        const boundaries = [
            createBoundary(1, 10),
            createBoundary(2, 5)
        ];
        const result = validateBoundaries(boundaries, 20);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should pass for touching ranges (adjacent)', () => {
        const boundaries = [
            createBoundary(1, 5),
            createBoundary(6, 10)
        ];
        const result = validateBoundaries(boundaries, 20);
        expect(result.isValid).toBe(true);
    });

    it('should handle complex mixed errors', () => {
        const boundaries = [
            createBoundary(0, 5),   // Invalid start
            createBoundary(10, 8),  // Invalid order
            createBoundary(2, 4)    // Overlap with first one (technically 0-5 and 2-4 overlap)
        ];
        const result = validateBoundaries(boundaries, 20);
        expect(result.isValid).toBe(false);

        const fields = result.errors.map(e => e.field);
        expect(fields).toContain('pageStart'); // from first
        expect(fields).toContain('pageStart'); // from second (order check uses pageStart field key in validation logic)
        expect(fields).toContain('range');     // overlap check
    });

    it('should pass with empty boundaries', () => {
        const result = validateBoundaries([], 20);
        expect(result.isValid).toBe(true);
    });
});
