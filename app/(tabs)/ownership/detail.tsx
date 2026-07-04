import {APP_COLORS} from "@/constants/colors";
import {
    getMyanmarLeadingClass,
    myanmarUITextStyle,
} from "@/constants/myanmar-font";
import {useTranslation} from "@/hooks/use-translation";
import {useLocaleStore} from "@/stores/client/locale-store";
import {useOwnershipRunningBalanceRefreshStore} from "@/stores/client/ownership-running-balance-refresh-store";
import {
    useOwnershipDetail,
    useOwnershipRunningBalance,
} from "@/stores/server/ownership/query";
import Ionicons from "@expo/vector-icons/Ionicons";
import {useQueryClient} from "@tanstack/react-query";
import {useLocalSearchParams, useRouter} from "expo-router";
import {useFocusEffect} from "expo-router/react-navigation";
import {useThrottledCallback} from "@/hooks/use-throttled-callback";
import {useCallback, useMemo} from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import {OwnershipRunningBalanceCard} from "./components/ownership-running-balance-card";
import {OwnershipSummaryCard} from "./components/ownership-summary-card";

export default function OwnershipDetailScreen() {
    const router = useRouter();
    const qc = useQueryClient();
    const insets = useSafeAreaInsets();
    const locale = useLocaleStore((state) => state.locale);
    const {detailOwnership: t} = useTranslation("ownership");

    const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
    const style = locale === "mm" ? mmTextStyle : undefined;
    const mmLeading = getMyanmarLeadingClass(locale);

    const params = useLocalSearchParams<{
        ownershipId?: string;
    }>();

    const ownershipId = String(params.ownershipId ?? "").trim();
    const hasRequiredParams = !!ownershipId;
    const takePendingRunningBalanceRefresh =
        useOwnershipRunningBalanceRefreshStore((state) => state.takePending);

    useFocusEffect(
        useCallback(() => {
            if (!ownershipId || !takePendingRunningBalanceRefresh(ownershipId)) {
                return;
            }
            void qc.invalidateQueries({
                queryKey: ["ownership", "runningBalance", ownershipId],
            });
        }, [qc, ownershipId, takePendingRunningBalanceRefresh]),
    );

    const {data: detailResponse, isPending: isDetailPending} =
        useOwnershipDetail(ownershipId, hasRequiredParams);

    const {data: runningBalanceData, isPending: isRunningBalancePending} =
        useOwnershipRunningBalance(ownershipId, hasRequiredParams);

    const summaryItem = detailResponse?.data;
    const records = runningBalanceData?.data ?? [];
    const isPending = isDetailPending || isRunningBalancePending;
    const itemCountLabel = t.labels.itemCount.replace(
        "{count}",
        String(records.length),
    );

    const onBack = useCallback(() => {
        qc.invalidateQueries({queryKey: ["ownership", "infinite"]});
        router.back();
    }, [qc, router]);

    const onEdit = useThrottledCallback(() => {
        if (!ownershipId) return;
        router.push({
            pathname: "/(tabs)/ownership/edit/[id]",
            params: {id: ownershipId},
        });
    }, 600);

    return (
        <SafeAreaView
            style={{backgroundColor: APP_COLORS.background, flex: 1}}
            edges={["top", "left", "right"]}
        >
            {/* back button , page title , sell button , edit button */}
            <View className="flex-row items-center px-4 pb-3 pt-1">
                <Pressable
                    onPress={onBack}
                    className="h-11 w-11 items-center justify-center rounded-full"
                    style={({pressed}) => ({
                        backgroundColor: pressed ? APP_COLORS.primary : APP_COLORS.background
                    })}
                >
                    <Ionicons name="arrow-back" size={22} color="#475569"/>
                </Pressable>

                <Text
                    className={`flex-1 px-3 text-center text-lg font-bold ${mmLeading}`}
                    style={[style, {color: APP_COLORS.textPrimary}]}
                >
                    {t.title}
                </Text>

                <View className="flex-row items-center gap-2">
                    <Pressable
                        accessibilityRole="button"
                        className="h-11 w-11 items-center justify-center rounded-full"
                        style={({pressed}) => ({
                            backgroundColor: pressed ? APP_COLORS.primary : APP_COLORS.card,
                            borderColor: APP_COLORS.border,
                            borderWidth: 1
                        })}
                    >
                        <Ionicons name="pricetag-outline" size={22} color="#475569"/>
                    </Pressable>

                    <Pressable
                        accessibilityRole="button"
                        onPress={onEdit}
                        disabled={!ownershipId}
                        className="h-11 w-11 items-center justify-center rounded-full"
                        style={({pressed}) => ({
                            backgroundColor: pressed ? APP_COLORS.primary : APP_COLORS.card,
                            borderColor: APP_COLORS.border,
                            borderWidth: 1,
                            opacity: ownershipId ? 1 : 0.5,
                        })}
                    >
                        <Ionicons name="create-outline" size={22} color="#475569"/>
                    </Pressable>
                </View>
            </View>

            {/* ownership details , running balance */}
            {!hasRequiredParams ? (
                <View
                    className="flex-1 items-center justify-center px-6"
                    style={{backgroundColor: APP_COLORS.background}}
                >
                    <Text
                        className={`text-center text-slate-500  ${mmLeading}`}
                        style={[style]}
                    >
                        {t.empty.summary}
                    </Text>
                </View>
            ) : isPending ? (
                <View
                    className="flex-1 items-center justify-center"
                    style={{backgroundColor: APP_COLORS.background}}
                >
                    <ActivityIndicator color={APP_COLORS.primary}/>
                </View>
            ) : (
                <View
                    className="flex-1"
                    style={{backgroundColor: APP_COLORS.background}}
                >
                    <ScrollView
                        className="px-4"
                        contentContainerStyle={{
                            paddingBottom: insets.bottom + 24,
                            flexGrow: 1,
                            backgroundColor: APP_COLORS.background,
                        }}
                    >
                        {/* ownership details */}
                        <OwnershipSummaryCard
                            item={summaryItem}
                            locale={locale}
                            labels={t.labels}
                            style={style}
                            mmLeading={mmLeading}
                        />

                        {!summaryItem ? (
                            <Text
                                className={`mt-4 text-center text-slate-500 ${mmLeading}`}
                                style={[style]}
                            >
                                {t.empty.summary}
                            </Text>
                        ) : null}

                        {/* running balance title , count */}
                        <View className="mt-5 flex-row items-center justify-between">
                            <Text
                                className={`text-base font-bold  ${mmLeading}`}
                                style={[style,{color:APP_COLORS.textPrimary}]}
                            >
                                {t.labels.financialRecords}
                            </Text>
                            <View
                                className={`rounded-full px-3 py-1`}
                                style={{
                                    backgroundColor:APP_COLORS.card,
                                    borderColor:APP_COLORS.primary,
                                    borderWidth:1
                                }}
                            >
                                <Text
                                    className={`text-xs font-bold  ${mmLeading}`}
                                    style={[style,{color:APP_COLORS.primary}]}
                                >
                                    {itemCountLabel}
                                </Text>
                            </View>
                        </View>

                        {/* running balance list */}
                        {records.length > 0 ? (
                            <View className="mt-4 gap-3">
                                {records.map((record, index) => (
                                    <OwnershipRunningBalanceCard
                                        key={`${record.proposalNo ?? "record"}-${record.proposeDate ?? index}`}
                                        item={record}
                                        locale={locale}
                                        labels={t.labels}
                                        style={style}
                                    />
                                ))}
                            </View>
                        ) : (
                            <Text
                                className={`mt-4 text-center text-slate-500 ${mmLeading}`}
                                style={[style]}
                            >
                                {t.empty.records}
                            </Text>
                        )}
                    </ScrollView>
                </View>
            )}
        </SafeAreaView>
    );
}
