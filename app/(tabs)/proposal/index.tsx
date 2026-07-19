import {APP_COLORS} from "@/constants/colors";
import {getMyanmarLeadingClass, myanmarUITextStyle} from "@/constants/myanmar-font";
import {useDebouncedValue} from "@/hooks/use-debounced-value";
import {useTimeBasedGreeting} from "@/hooks/use-time-based-greeting";
import {useAuthStore} from "@/stores/auth-store";
import {useLocaleStore} from "@/stores/client/locale-store";
import {useProposalListRefreshStore} from "@/stores/client/proposal-list-refresh-store";
import {useProposalsInfinite} from "@/stores/server/proposal/query";
import {useServiceTypeLookup} from "@/stores/server/service-type/lookup-query";
import type {
    ProposalAdvancedFilters,
    ProposalTabStatus,
} from "@/stores/server/proposal/search-columns";
import {useRouter, useLocalSearchParams} from "expo-router";
import {useFocusEffect} from "expo-router/react-navigation";
import {useQueryClient} from "@tanstack/react-query";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {ActivityIndicator, FlatList, Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {ProposalAdvancedFilters as ProposalAdvancedFiltersCard} from "@/components/proposal/proposal-advanced-filters";
import {ProposalCard} from "@/components/proposal/proposal-card";
import {ProposalHeader} from "@/components/proposal/proposal-header";
import {ProposalSearchToolbar} from "@/components/proposal/proposal-search-toolbar";
import {ProposalTabs} from "@/components/proposal/proposal-tabs";
import {useTranslation} from "@/hooks/use-translation";
import { useThrottledCallback } from '@/hooks/use-throttled-callback';
import {ProposalItem} from "@/stores/server/proposal/typed";
import { useUserLookupOptions} from "@/stores/server/user/user-lookup-query";


const TAB_ORDER: ProposalTabStatus[] = ["INFORM", "APPROVED", "TERMINATED"];

type ProposalListUiState = ProposalAdvancedFilters & {
    quickQuery: string;
    advancedOpen: boolean;
};

const initialProposalListUi: ProposalListUiState = {
    quickQuery: "",
    advancedOpen: false,
    proposalNo: "",
    ownerId: "",
    plateNo: "",
    proposalDateFrom: "",
    proposalDateTo: "",
    serviceTypeCsv: "",
    serviceDateFrom: "",
    serviceDateTo: "",
    createdByCsv: "",
};

const emptyProposalAdvancedApplied: ProposalAdvancedFilters = {
    proposalNo: "",
    ownerId: "",
    plateNo: "",
    proposalDateFrom: "",
    proposalDateTo: "",
    serviceTypeCsv: "",
    serviceDateFrom: "",
    serviceDateTo: "",
    createdByCsv: "",
};

export default function ProposalScreen() {

    const router = useRouter();
    const params = useLocalSearchParams<{ status?: string | string[] }>();
    const qc = useQueryClient();
    const takePendingRefresh = useProposalListRefreshStore((state) => state.takePending);
    const locale = useLocaleStore((state) => state.locale);
    const role = useAuthStore((state) => state.role);
    const fullName = useAuthStore((state) => state.fullName);
    const t = useTranslation('proposal')

    const [status, setStatus] = useState<ProposalTabStatus>("INFORM");
    const [ui, setUi] = useState<ProposalListUiState>(initialProposalListUi);
    const [appliedAdvanced, setAppliedAdvanced] = useState<ProposalAdvancedFilters>(() => ({
            ...emptyProposalAdvancedApplied,
        }));

    useEffect(() => {
        const rawStatus = Array.isArray(params.status)
            ? params.status[0]
            : params.status;

        if (
            rawStatus === "INFORM" ||
            rawStatus === "APPROVED" ||
            rawStatus === "TERMINATED"
        ) {
            setStatus(rawStatus);
        }
    }, [params.status]);

    const patchUi = useCallback((next: Partial<ProposalListUiState>) => {
        setUi((prev) => ({...prev, ...next}));
    }, []);
    const debouncedQuickQuery = useDebouncedValue(ui.quickQuery, 500);

    const greeting = useTimeBasedGreeting();
    const mmLeading = getMyanmarLeadingClass(locale);
    const upperRole = (role || "").toUpperCase();
    const showOwnerId = upperRole === "ADMIN";
    const showCreatedBy = upperRole === "ADMIN";
    const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
    const style = locale === "mm" ? mmTextStyle : undefined;

    const {resolveServiceTypeLabel} = useServiceTypeLookup();

    useFocusEffect(
        useCallback(() => {
            if (!takePendingRefresh()) return;
            void qc.invalidateQueries({queryKey: ["proposal", "infinite"]});
        }, [qc, takePendingRefresh]),
    );

    const { data: userOptions = [] } = useUserLookupOptions("", upperRole === "ADMIN");


    const getServiceTypeDisplayLabel = useCallback(
        (code: string) => resolveServiceTypeLabel(code, locale),
        [resolveServiceTypeLabel, locale],
    );

    const filters = useMemo(
        () => ({
            quickQuery: debouncedQuickQuery,
            ...appliedAdvanced,
        }),
        [debouncedQuickQuery, appliedAdvanced],
    );

    const {data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending} =
        useProposalsInfinite(status, filters, role, true);

    const items = useMemo(
        () => data?.pages.flatMap((page) => page.data.data) ?? [],
        [data],
    );

    const advancedFilters: ProposalAdvancedFilters = useMemo(
        () => ({
            proposalNo: ui.proposalNo,
            ownerId: ui.ownerId,
            plateNo: ui.plateNo,
            proposalDateFrom: ui.proposalDateFrom,
            proposalDateTo: ui.proposalDateTo,
            serviceTypeCsv: ui.serviceTypeCsv,
            serviceDateFrom: ui.serviceDateFrom,
            serviceDateTo: ui.serviceDateTo,
            createdByCsv: ui.createdByCsv,
        }),
        [ui],
    );

    const handleCardDetailBtn = useThrottledCallback((item: ProposalItem) => {
        router.push({
            pathname: "/(tabs)/proposal/detail",
            params: {
                proposalNo: item.proposalNo,
                ownershipId: item.ownershipId,
            },
        })
    }, 600);

    const handleAddPress = useThrottledCallback(()=>{
        router.push("/(tabs)/proposal/create")
    },600)

    return (
        <SafeAreaView
            edges={["top", "left", "right"]}
            style={{flex: 1, backgroundColor: APP_COLORS.background}}
        >
            <FlatList
                data={items}
                className="px-4"
                style={{flex: 1}}
                keyExtractor={(item) => `${item.proposalNo}-${item.proposalDate}`}
                // proposal card
                renderItem={({item}) => (
                    <ProposalCard
                        item={item}
                        onPressDetail={(selected) =>handleCardDetailBtn(selected)}
                        mmLeading={mmLeading}
                        resolveServiceTypeLabel={getServiceTypeDisplayLabel}
                    />
                )}
                onEndReachedThreshold={0.2}
                onEndReached={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                        fetchNextPage();
                    }
                }}
                // header , tabs , search
                ListHeaderComponent={
                    <View className="pb-3 pt-1">
                        <ProposalHeader
                            title={t.master.title}
                            welcomeLabel={greeting}
                            fullName={fullName || "-"}
                            textStyle={style}
                            mmLeading = {mmLeading}
                        />
                        <ProposalTabs
                            value={status}
                            onChange={setStatus}
                            tabs={TAB_ORDER}
                            style={style}
                            mmLeading = {mmLeading}
                        />
                        <ProposalSearchToolbar
                            locale={locale}
                            quickQuery={ui.quickQuery}
                            placeholder={t.master.searchPlaceholder}
                            advancedOpen={ui.advancedOpen}
                            onChangeQuickQuery={(quickQuery) => patchUi({quickQuery})}
                            onClearQuickQuery={() => patchUi({quickQuery: ""})}
                            onToggleAdvanced={() =>
                                setUi((prev) => ({
                                    ...prev,
                                    advancedOpen: !prev.advancedOpen,
                                }))
                            }
                            onPressAdd={() => handleAddPress()}
                            mmLeading={mmLeading}
                            style={style}
                            role={upperRole}
                        />
                        {ui.advancedOpen ? (
                            <ProposalAdvancedFiltersCard
                                filters={advancedFilters}
                                locale={locale}
                                showOwnerId={showOwnerId}
                                showCreatedBy={showCreatedBy}
                                onChange={patchUi}
                                onReset={() => {
                                    setAppliedAdvanced({...emptyProposalAdvancedApplied});
                                    patchUi({
                                        quickQuery: "",
                                        proposalNo: "",
                                        ownerId: "",
                                        plateNo: "",
                                        proposalDateFrom: "",
                                        proposalDateTo: "",
                                        serviceTypeCsv: "",
                                        serviceDateFrom: "",
                                        serviceDateTo: "",
                                        createdByCsv: "",
                                    });
                                }}
                                onApply={() => {
                                    setAppliedAdvanced({
                                        proposalNo: ui.proposalNo,
                                        ownerId: ui.ownerId,
                                        plateNo: ui.plateNo,
                                        proposalDateFrom: ui.proposalDateFrom,
                                        proposalDateTo: ui.proposalDateTo,
                                        serviceTypeCsv: ui.serviceTypeCsv,
                                        serviceDateFrom: ui.serviceDateFrom,
                                        serviceDateTo: ui.serviceDateTo,
                                        createdByCsv: ui.createdByCsv,
                                    });
                                    patchUi({advancedOpen: false});
                                }}
                                style={style}
                                userOptions={userOptions}
                            />
                        ) : null}
                    </View>
                }
                ListEmptyComponent={
                    isPending ? (
                        <View className="items-center py-10">
                            <ActivityIndicator color={APP_COLORS.primary}/>
                        </View>
                    ) : (
                        <Text
                            className={`px-6 py-8 text-center text-slate-500 ${mmLeading}`}
                        >
                            {status === 'INFORM' ? t.master.empty_INFORM : status === 'APPROVED' ? t.master.empty_APPROVED : t.master.empty_TERMINATED}
                        </Text>
                    )
                }
                ListFooterComponent={
                    isFetchingNextPage ? (
                        <View className="py-4">
                            <ActivityIndicator color={APP_COLORS.primary}/>
                        </View>
                    ) : null
                }
                contentContainerStyle={{paddingBottom: 24, flexGrow: 1}}
            />
        </SafeAreaView>
    );
}
