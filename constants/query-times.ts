

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
// LOOKUP: Infinity,
// SHORT: 30 * 1000,

export const PROPOSAL_QUERY = {
    LIST: 5 * MINUTE,
    LIST_GC: 5 * MINUTE,
    DETAIL: 5 * MINUTE,
    DETAIL_GC: 10 * MINUTE,
    HISTORY: 5 * MINUTE,
    HISTORY_GC: 10 * MINUTE,
} as const;
