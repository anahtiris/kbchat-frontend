import { RagBoundary } from "@/lib/types";

export type ErrorCode = "PAGE_MIN" | "PAGE_MAX" | "INVALID_RANGE" | "OVERLAP";

export interface ValidationError {
    index: number;
    field: "pageStart" | "pageEnd" | "range";
    code: ErrorCode;
    params?: Record<string, any>;
}

export function validateBoundaries(
    boundaries: RagBoundary[],
    totalPages: number
): { isValid: boolean; errors: ValidationError[] } {
    const errors: ValidationError[] = [];

    boundaries.forEach((boundary, index) => {
        if (boundary.pageStart < 1) {
            errors.push({ index, field: "pageStart", code: "PAGE_MIN" });
        }
        if (boundary.pageEnd > totalPages) {
            errors.push({ index, field: "pageEnd", code: "PAGE_MAX", params: { max: totalPages } });
        }
        if (boundary.pageStart > boundary.pageEnd) {
            errors.push({ index, field: "pageStart", code: "INVALID_RANGE" });
        }
    });

    for (let i = 0; i < boundaries.length; i++) {
        for (let j = i + 1; j < boundaries.length; j++) {
            const b1 = boundaries[i];
            const b2 = boundaries[j];

            const overlap = Math.max(b1.pageStart, b2.pageStart) <= Math.min(b1.pageEnd, b2.pageEnd);

            if (overlap) {
                errors.push({ index: i, field: "range", code: "OVERLAP", params: { otherIndex: j + 1 } });
                errors.push({ index: j, field: "range", code: "OVERLAP", params: { otherIndex: i + 1 } });
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}
