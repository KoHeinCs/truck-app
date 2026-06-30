import {APP_COLORS} from "@/constants/colors";
import {getMyanmarLeadingClass, myanmarUITextStyle} from "@/constants/myanmar-font";
import {useDebouncedValue} from "@/hooks/use-debounced-value";
import {useTimeBasedGreeting} from "@/hooks/use-time-based-greeting";
import {useAuthStore} from "@/stores/auth-store";
import {useLocaleStore} from "@/stores/client/locale-store";
import {useOwnershipsInfinite} from "@/stores/server/ownership/query";
import type {
    OwnershipAdvancedFilters as OwnershipAdvancedFilterValues,
    OwnershipTruckStatus,
} from "@/stores/server/ownership/search-columns";
import type {OwnershipItem} from "@/stores/server/ownership/typed";
import React, {useCallback, useMemo, useState} from "react";
import {ActivityIndicator, FlatList, Text, View} from "react-native";
import {type Href, useRouter} from "expo-router";
import {useThrottledCallback} from "@/hooks/use-throttled-callback";
import {SafeAreaView} from "react-native-safe-area-context";
import {OwnershipAdvancedFilters} from "./components/ownership-advanced-filters";
import {OwnershipCard} from "./components/ownership-card";
import {OwnershipHeader} from "./components/ownership-header";
import {OwnershipSearchToolbar} from "./components/ownership-search-toolbar";
import {OwnershipTabs} from "./components/ownership-tabs";
import {useOwnerLookupOptions} from "@/stores/server/ownership/owner-lookup-query";
import {useTranslation} from "@/hooks/use-translation";

type OwnershipListUiState = OwnershipAdvancedFilterValues & {
    quickQuery: string;
    advancedOpen: boolean;
};

const initialOwnershipListUi: OwnershipListUiState = {
    quickQuery: "",
    advancedOpen: false,
    plateNo: "",
    licenseCity: "",
    licenseEndDate: "",
    profit: "",
    ownerIdCsv: "",
};

const emptyOwnershipAdvancedApplied: OwnershipAdvancedFilterValues = {
    plateNo: "",
    licenseCity: "",
    licenseEndDate: "",
    profit: "",
    ownerIdCsv: "",
};

const TABS: OwnershipTruckStatus[] = ["ACTIVE", "SOLD_OUT"];


export default function OwnerShip() {
    const router = useRouter();
    const locale = useLocaleStore((state) => state.locale);
    const fullName = useAuthStore((state) => state.fullName);
    const role = useAuthStore((state) => state.role);
    const upperRole = (role || "").toUpperCase();
    const greeting = useTimeBasedGreeting();
    const t  = useTranslation('ownership')
    const showOwnerId = upperRole === "ADMIN";
    const {data: ownerOptions = []} = useOwnerLookupOptions("",upperRole === "ADMIN");


    const [status, setStatus] = useState<OwnershipTruckStatus>("ACTIVE");
    const [ui, setUi] = useState<OwnershipListUiState>(initialOwnershipListUi);
    const [appliedAdvanced, setAppliedAdvanced] =
        useState<OwnershipAdvancedFilterValues>(() => ({
            ...emptyOwnershipAdvancedApplied,
        }));
    const patchUi = useCallback((next: Partial<OwnershipListUiState>) => {
        setUi((prev) => ({...prev, ...next}));
    }, []);
    const debouncedQuickQuery = useDebouncedValue(ui.quickQuery, 500);

    const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
    const style = locale === "mm" ? mmTextStyle : undefined;
    const mmLeading = getMyanmarLeadingClass(locale);

    const filters = useMemo(
        () => ({
            quickQuery: debouncedQuickQuery,
            ...appliedAdvanced,
        }),
        [debouncedQuickQuery, appliedAdvanced],
    );

    const {data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending} = useOwnershipsInfinite(status, filters, role);

    const items = useMemo(
        () => data?.pages.flatMap((page) => page.data.data) ?? [],
        [data],
    );

    const advancedFilters: OwnershipAdvancedFilterValues = useMemo(
        () => ({
            plateNo: ui.plateNo,
            licenseCity: ui.licenseCity,
            licenseEndDate: ui.licenseEndDate,
            profit: ui.profit,
            ownerIdCsv: ui.ownerIdCsv,
        }),
        [ui],
    );

    const openDetail = useThrottledCallback((item: OwnershipItem) => {
        if (!item.id) return;
        router.push({
            pathname: "/(tabs)/ownership/detail",
            params: {ownershipId: item.id},
        });
    }, 600);

    const handleAddPress = useThrottledCallback(() => {
        router.push("/(tabs)/ownership/search" as Href)
    }, 600)

    return (
        <SafeAreaView
            style={{flex: 1}}
            className="flex-1 bg-[#f3f7fb]"
            edges={["top", "left", "right"]}
        >
            <FlatList
                data={items}
                className="px-4"
                style={{flex: 1}}
                keyExtractor={(item, index) => item.id || `${item.truckPlateNo}-${index}`}
                renderItem={({item}) => (
                    // ownership card
                    <OwnershipCard
                        item={item}
                        locale={locale}
                        labels={t.card}
                        onPress={() => openDetail(item)}
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
                        <OwnershipHeader
                            title={t.master.title}
                            welcomeLabel={greeting}
                            fullName={fullName || "-"}
                            style={style}
                            mmLeading={mmLeading}
                        />
                        <OwnershipTabs
                            value={status}
                            onChange={setStatus}
                            style={style}
                            mmLeading={mmLeading}
                            tabs={TABS}
                        />
                        <OwnershipSearchToolbar
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
                            style={style}
                            mmLeading={mmLeading}
                            role={upperRole}
                        />
                        {ui.advancedOpen ? (
                            <OwnershipAdvancedFilters
                                filters={advancedFilters}
                                locale={locale}
                                style={style}
                                showOwnerId={showOwnerId}
                                onChange={patchUi}
                                onReset={() => {
                                    setAppliedAdvanced({...emptyOwnershipAdvancedApplied});
                                    patchUi({
                                        quickQuery: "",
                                        plateNo: "",
                                        licenseCity: "",
                                        licenseEndDate: "",
                                        profit: "",
                                        ownerIdCsv: "",
                                    });
                                }}
                                onApply={() => {
                                    setAppliedAdvanced({
                                        plateNo: ui.plateNo,
                                        licenseCity: ui.licenseCity,
                                        licenseEndDate: ui.licenseEndDate,
                                        profit: ui.profit,
                                        ownerIdCsv: ui.ownerIdCsv,
                                    });
                                    patchUi({advancedOpen: false});
                                }}
                                mmLeading={mmLeading}
                                ownerOptions={ownerOptions}
                                status={status}
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
                            className="px-6 py-8 text-center text-slate-500"
                            style={style}
                        >
                            {status === 'ACTIVE' ? t.master.empty_ACTIVE : t.master.empty_SOLD_OUT}
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
