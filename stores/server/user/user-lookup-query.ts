import {useQuery} from "@tanstack/react-query";
import {axios} from "@/stores/server/api";

type UserLookupResponse = {
    data?: {
        data?: Array<Record<string, unknown>>
    }
}

export type UserLookupOption = {
    value: string;
    label: string;
    role: string;
}

const lookupUsers = async (query: string): Promise<UserLookupResponse> => {
    const {data} = await axios.get("/user/get-all-users");
    return data;
};

const toString = (value: unknown): string => String(value ?? "").trim();

const normalizeUserOptions
    = (response: UserLookupResponse): UserLookupOption[] => {

    const items = Array.isArray(response?.data) ? response.data : [];

    if (items.length === 0) return [];

    const uniqueOptionsMap = items.reduce((map, item) => {
        const value = toString(item?.id);
        const label = toString(item?.fullName);
        const role = toString(item?.role);

        if (!value || map.has(value)) return map;

        return map.set(value, {value, label,role});
    }, new Map<string, UserLookupOption>());

    const uniqueOptionsArray: UserLookupOption [] = Array.from(uniqueOptionsMap.values());

    return [
        { value: '', label: 'All' ,role:''},
        ...uniqueOptionsArray
    ]

}


export function useUserLookupOptions(query: string, enabled = true) {
    return useQuery({
        queryKey: ["all-users-lookup", query.trim()],
        queryFn: () => lookupUsers(query),
        select: normalizeUserOptions,
        staleTime: 1000 * 60 * 10, // 10 mins
        gcTime: 1000 * 60 * 15, // 15 mins
        enabled:enabled
    })
}
