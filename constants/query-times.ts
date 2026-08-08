

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;

export const DEFAULT_QUERY = {
    DEFAULT : 5 * MINUTE,
    DEFAULT_GC : 10 * MINUTE
} as const ;

export const PROPOSAL_QUERY = {
    LIST: 5 * MINUTE,
    LIST_GC: 5 * MINUTE,
    DETAIL: 5 * MINUTE,
    DETAIL_GC: 10 * MINUTE,
    HISTORY: 5 * MINUTE,
    HISTORY_GC: 10 * MINUTE,
} as const;

export const OWNERSHIP_QUERY = {
    LIST: 5 * MINUTE,
    LIST_GC: 5 * MINUTE,
    DETAIL: 5 * MINUTE,
    DETAIL_GC: 10 * MINUTE,
    RUNNING_BALANCE: 5 * MINUTE,
    RUNNING_BALANCE_GC: 10 * MINUTE,
} as const;

export const SERVICE_QUERY = {

}

export const LOOKUP_QUERY = {
    LOOKUP: 30 * MINUTE,
    LOOKUP_GC: 30 * MINUTE,
} as const;
