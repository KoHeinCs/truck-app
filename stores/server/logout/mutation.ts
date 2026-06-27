import {useMutation, useQueryClient} from "@tanstack/react-query";
import { axios } from "../api";

const logout = async () => {
    const { data } = await axios.put("/auth/logout");
    return data;
};

export function useLogout() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: logout,
        onSuccess: () => {
            // Clear all active dynamic queries from the cache to prevent data leakage across users
           qc.clear();
        },
    });

}
