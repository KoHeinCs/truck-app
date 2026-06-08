import {APP_COLORS} from "@/constants/colors";
import {getMyanmarLeadingClass, myanmarUITextStyle} from "@/constants/myanmar-font";
import {useDebouncedValue} from "@/hooks/use-debounced-value";
import {useTimeBasedGreeting} from "@/hooks/use-time-based-greeting";
import {useAuthStore} from "@/stores/auth-store";
import {useLocaleStore} from "@/stores/client/locale-store";
import {useProposalsInfinite} from "@/stores/server/proposal/query";
import type {
    ProposalAdvancedFilters,
    ProposalTabStatus,
} from "@/stores/server/proposal/search-columns";
import {useRouter} from "expo-router";
import React, {useCallback, useMemo, useState} from "react";
import {ActivityIndicator, FlatList, Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {ProposalAdvancedFilters as ProposalAdvancedFiltersCard} from "./proposal-advanced-filters";
import {ProposalCard} from "./proposal-card";
import {ProposalHeader} from "./proposal-header";
import {ProposalSearchToolbar} from "./proposal-search-toolbar";
import {ProposalTabs} from "./proposal-tabs";
import {useTranslation} from "@/hooks/use-translation";

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
    const locale = useLocaleStore((state) => state.locale);
    const role = useAuthStore((state) => state.role);
    const fullName = useAuthStore((state) => state.fullName);
    const t = useTranslation('proposal')

    const [status, setStatus] = useState<ProposalTabStatus>("INFORM");
    const [ui, setUi] = useState<ProposalListUiState>(initialProposalListUi);
    const [appliedAdvanced, setAppliedAdvanced] = useState<ProposalAdvancedFilters>(() => ({
            ...emptyProposalAdvancedApplied,
        }));
    const patchUi = useCallback((next: Partial<ProposalListUiState>) => {
        setUi((prev) => ({...prev, ...next}));
    }, []);
    const debouncedQuickQuery = useDebouncedValue(ui.quickQuery, 500);

    const greeting = useTimeBasedGreeting();
    const mmLeading = getMyanmarLeadingClass(locale);
    const upperRole = (role || "").toUpperCase();
    const showOwnerId = upperRole === "ADMIN";
    const showCreatedBy = upperRole === "ADMIN" || upperRole === "OWNER";
    const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
    const style = locale === "mm" ? mmTextStyle : undefined;

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
                        onPressDetail={(selected) =>
                            router.push({
                                pathname: "/(tabs)/proposal/detail",
                                params: {
                                    proposalNo: selected.proposalNo,
                                    ownershipId: selected.ownershipId,
                                },
                            })
                        }
                        onPressEdit={(selected) =>
                            router.push({
                                pathname: "/(tabs)/proposal/edit",
                                params: {
                                    proposalNo: selected.proposalNo,
                                    ownershipId: selected.ownershipId,
                                },
                            })
                        }
                        mmLeading={mmLeading}
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
                            onPressAdd={() => router.push("/(tabs)/proposal/create")}
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
