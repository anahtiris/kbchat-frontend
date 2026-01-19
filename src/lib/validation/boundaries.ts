import { RagBoundary } from "@/lib/types";

export interface ValidationError {
    index: number;
    field: "pageStart" | "pageEnd" | "range";
    message: string;
}

export function validateBoundaries(
    boundaries: RagBoundary[],
    totalPages: number
): { isValid: boolean; errors: ValidationError[] } {
    const errors: ValidationError[] = [];

    boundaries.forEach((boundary, index) => {
        // 1. Basic range check
        if (boundary.pageStart < 1) {
            errors.push({ index, field: "pageStart", message: "Page must be at least 1" });
        }
        if (boundary.pageEnd > totalPages) {
            errors.push({ index, field: "pageEnd", message: `Page cannot exceed ${totalPages}` });
        }
        if (boundary.pageStart > boundary.pageEnd) {
            errors.push({ index, field: "pageStart", message: "Start page must be before end page" });
        }
    });

    // 2. Overlap check (only for same type for now, or generally?)
    // Requirement says: "Overlapping or conflicting ranges". 
    // If we have two 'include' ranges that overlap, it's just redundant but valid? 
    // But if we have 'include 1-10' and 'exclude 5-15', that's a conflict.
    // Let's being strict: No overlaps allowed at all to keep it simple and explicit as requested ("Simple", "Explicit").

    for (let i = 0; i < boundaries.length; i++) {
        for (let j = i + 1; j < boundaries.length; j++) {
            const b1 = boundaries[i];
            const b2 = boundaries[j];

            // Check overlap
            const overlap = Math.max(b1.pageStart, b2.pageStart) <= Math.min(b1.pageEnd, b2.pageEnd);

            if (overlap) {
                errors.push({ index: i, field: "range", message: `Overlaps with range #${j + 1}` });
                errors.push({ index: j, field: "range", message: `Overlaps with range #${i + 1}` });
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}
