import {ServiceDatePicker} from "@/components/service-date-picker";
import {APP_COLORS} from "@/constants/colors";
import {
    getMyanmarLeadingClass,
    myanmarUITextStyle,
} from "@/constants/myanmar-font";
import {useTranslation} from "@/hooks/use-translation";
import {getApiErrorAlertCopy} from "@/lib/api-error-alert";
import {useLocaleStore} from "@/stores/client/locale-store";
import {useOwnershipRunningBalanceRefreshStore} from "@/stores/client/ownership-running-balance-refresh-store";
import {useDeleteOwnership} from "@/stores/server/ownership/delete-mutation";
import {
    useOwnershipDetail,
    useOwnershipRunningBalance,
} from "@/stores/server/ownership/query";
import {formatDate, toIsoDate, todayIsoLocal} from "@/utils/dateUtil";
import Ionicons from "@expo/vector-icons/Ionicons";
import {useQueryClient} from "@tanstack/react-query";
import {useLocalSearchParams, useRouter} from "expo-router";
import {useFocusEffect} from "expo-router/react-navigation";
import {useThrottledCallback} from "@/hooks/use-throttled-callback";
import {useCallback, useMemo, useState} from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
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
import {useServiceTypeLookup} from "@/stores/server/service-type/lookup-query";
import {useAuthStore} from "@/stores/auth-store";

export default function OwnershipDetailScreen() {
    const role = useAuthStore((state) => state.role);
    const currentRole = (role || "").toUpperCase();
    const isAdmin = currentRole === "ADMIN";
    const router = useRouter();
    const qc = useQueryClient();
    const insets = useSafeAreaInsets();
    const locale = useLocaleStore((state) => state.locale);
    const {detailOwnership: t} = useTranslation("ownership");
    const errorCatalog = useTranslation("error");
    const {mutate: deleteOwnership, isPending: isDeleting} = useDeleteOwnership();

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteSellDate, setDeleteSellDate] = useState("");
    const [deleteSellDateError, setDeleteSellDateError] = useState("");

    const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
    const style = locale === "mm" ? mmTextStyle : undefined;
    const mmLeading = getMyanmarLeadingClass(locale);

    const params = useLocalSearchParams<{ ownershipId?: string; }>();

    const ownershipId = String(params.ownershipId ?? "").trim();
    const hasRequiredParams = !!ownershipId;
    const takePendingRunningBalanceRefresh =
        useOwnershipRunningBalanceRefreshStore((state) => state.takePending);
    const {resolveServiceTypeLabel} = useServiceTypeLookup();

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

    const {data: detailResponse, isPending: isDetailPending} = useOwnershipDetail(ownershipId, hasRequiredParams);
    const {data: runningBalanceData, isPending: isRunningBalancePending} = useOwnershipRunningBalance(ownershipId, hasRequiredParams);

    const summaryItem = detailResponse?.data;
    const records = runningBalanceData?.data ?? [];
    const isPending = isDetailPending || isRunningBalancePending;
    const itemCountLabel = t.running.labels.itemCount.replace(
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

    const onSell = useThrottledCallback(() => {
        if (!ownershipId) return;
        router.push({
            pathname: "/(tabs)/ownership/sell",
            params: {ownershipId},
        });
    }, 600);

    const onPressProposal = useThrottledCallback((proposalNo: string) => {
        if (!ownershipId || !proposalNo) return;
        router.push({
            pathname: "/(tabs)/proposal/detail",
            params: {
                proposalNo,
                ownershipId,
            },
        });
    }, 600);

    const openDeleteModal = useCallback(() => {
        const existingSellDate = formatDate(summaryItem?.sellDate);
        setDeleteSellDate(existingSellDate === "-" ? "" : existingSellDate);
        setDeleteSellDateError("");
        setDeleteModalOpen(true);
    }, [summaryItem?.sellDate]);

    const closeDeleteModal = useCallback(() => {
        if (isDeleting) return;
        setDeleteModalOpen(false);
        setDeleteSellDateError("");
    }, [isDeleting]);

    const validateDeleteSellDate = useCallback(
        (value: string) => {
            const trimmed = value.trim();
            if (!trimmed) {
                return t.delete.sellDateRequired;
            }
            const iso = toIsoDate(trimmed);
            if (!iso) {
                return t.delete.sellDateInvalid;
            }
            if (iso > todayIsoLocal()) {
                return t.delete.sellDateFuture;
            }
            return "";
        },
        [t.delete],
    );

    const handleDelete = useCallback(() => {
        const sellDateError = validateDeleteSellDate(deleteSellDate);
        if (sellDateError) {
            setDeleteSellDateError(sellDateError);
            return;
        }

        const sellDateIso = toIsoDate(deleteSellDate.trim());
        const version = summaryItem?.version;
        if (!ownershipId || sellDateIso === null || version === undefined || version === null) {
            Alert.alert(t.delete.dialog.errorTitle, t.delete.dialog.errorBody);
            return;
        }

        deleteOwnership(
            {
                ownershipId,
                version: Number(version),
                sellDate: sellDateIso,
            },
            {
                onSuccess: () => {
                    closeDeleteModal();
                    Alert.alert(t.delete.dialog.successTitle, t.delete.dialog.successBody, [
                        {
                            text: "OK",
                            onPress: () => {
                                qc.invalidateQueries({queryKey: ["ownership", "infinite"]});
                                router.back();
                            },
                        },
                    ]);
                },
                onError: (err: unknown) => {
                    const {title, message} = getApiErrorAlertCopy(err, errorCatalog, {
                        title: t.delete.dialog.errorTitle,
                        message: t.delete.dialog.errorBody,
                    });
                    Alert.alert(title, message);
                },
            },
        );
    }, [
        closeDeleteModal,
        deleteOwnership,
        deleteSellDate,
        errorCatalog,
        ownershipId,
        qc,
        router,
        summaryItem?.version,
        t.delete,
        validateDeleteSellDate,
    ]);

    const deleteTitle = summaryItem?.equipmentName || summaryItem?.truckPlateNo || "-";

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
                    {isAdmin && (
                        <Pressable
                            accessibilityRole="button"
                            onPress={onSell}
                            disabled={!ownershipId}
                            className="h-11 w-11 items-center justify-center rounded-full"
                            style={({pressed}) => ({
                                backgroundColor: pressed ? APP_COLORS.primary : APP_COLORS.card,
                                borderColor: APP_COLORS.border,
                                borderWidth: 1,
                                opacity: ownershipId ? 1 : 0.5,
                            })}
                        >
                            <Ionicons name="pricetag-outline" size={22} color="#475569"/>
                        </Pressable>
                    )}

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
                            labels={t.details.labels}
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
                                {t.running.labels.financialRecords}
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
                                        labels={t.running.labels}
                                        style={style}
                                        mmLeading={mmLeading}
                                        resolveServiceTypeLabel={resolveServiceTypeLabel}
                                        local={locale}
                                        onPressProposal={onPressProposal}
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

                        {isAdmin && summaryItem ? (
                            <Pressable
                                onPress={openDeleteModal}
                                disabled={!ownershipId || isDeleting}
                                className="mt-6 h-14 items-center justify-center rounded-xl"
                                style={({pressed}) => ({
                                    backgroundColor: pressed
                                        ? APP_COLORS.errorSoft
                                        : APP_COLORS.card,
                                    borderColor: APP_COLORS.error,
                                    borderWidth: 1,
                                    opacity: ownershipId && !isDeleting ? 1 : 0.6,
                                })}
                            >
                                <View className="flex-row items-center gap-2">
                                    <Ionicons
                                        name="trash-outline"
                                        size={18}
                                        color={APP_COLORS.error}
                                    />
                                    <Text
                                        className={`text-sm font-semibold ${mmLeading}`}
                                        style={[style, {color: APP_COLORS.error}]}
                                    >
                                        {t.delete.button}
                                    </Text>
                                </View>
                            </Pressable>
                        ) : null}
                    </ScrollView>
                </View>
            )}

            <Modal
                visible={deleteModalOpen}
                transparent
                animationType="fade"
                onRequestClose={closeDeleteModal}
            >
                <Pressable
                    className="flex-1 items-center justify-center bg-black/40 px-6"
                    onPress={closeDeleteModal}
                >
                    <Pressable
                        className="w-full overflow-hidden rounded-2xl bg-white"
                        onPress={(event) => event.stopPropagation()}
                    >
                        <View
                            className="border-b px-5 py-4"
                            style={{
                                borderColor: APP_COLORS.errorSoft,
                                backgroundColor: APP_COLORS.errorSoft,
                            }}
                        >
                            <Text
                                className={`text-lg font-bold ${mmLeading}`}
                                style={[style, {color: APP_COLORS.error}]}
                            >
                                {t.delete.modalTitle}
                            </Text>
                            <Text
                                className={`mt-1 text-sm font-semibold ${mmLeading}`}
                                style={[style, {color: APP_COLORS.textPrimary}]}
                            >
                                {deleteTitle}
                            </Text>
                        </View>

                        <View className="p-5">
                            <Text
                                className={`text-sm ${mmLeading}`}
                                style={[style, {color: APP_COLORS.textSecondary}]}
                            >
                                {t.delete.modalBody}
                            </Text>

                            <View className="mt-4 gap-1.5">
                                <View className="flex-row items-center gap-1">
                                    <Text
                                        className={`text-sm font-medium ${mmLeading}`}
                                        style={[style, {color: APP_COLORS.textSecondary}]}
                                    >
                                        {t.delete.sellDateLabel}
                                    </Text>
                                </View>
                                <ServiceDatePicker
                                    locale={locale}
                                    value={deleteSellDate}
                                    onChange={(value) => {
                                        setDeleteSellDate(value);
                                        if (deleteSellDateError) {
                                            setDeleteSellDateError(
                                                validateDeleteSellDate(value),
                                            );
                                        }
                                    }}
                                    placeholder={t.delete.sellDatePlaceholder}
                                    doneLabel={locale === "mm" ? "ရွေးချယ်မည်" : "Done"}
                                    mode="date"
                                    maximumDate={new Date()}
                                    style={style}
                                    triggerClassName={`h-12 px-3 ${mmLeading}`}
                                />
                                {!!deleteSellDateError && (
                                    <Text
                                        className={`text-xs font-normal ${mmLeading}`}
                                        style={[{color: APP_COLORS.error}, style]}
                                    >
                                        {deleteSellDateError}
                                    </Text>
                                )}
                            </View>

                            <View className="mt-5 flex-row gap-3">
                                <Pressable
                                    onPress={closeDeleteModal}
                                    disabled={isDeleting}
                                    className="h-12 flex-1 items-center justify-center rounded-xl"
                                    style={({pressed}) => ({
                                        backgroundColor: pressed
                                            ? APP_COLORS.primarySoft
                                            : APP_COLORS.card,
                                        borderColor: APP_COLORS.border,
                                        borderWidth: 1,
                                        opacity: isDeleting ? 0.7 : 1,
                                    })}
                                >
                                    <Text
                                        className={`text-sm font-semibold ${mmLeading}`}
                                        style={[style, {color: APP_COLORS.textPrimary}]}
                                    >
                                        {t.delete.actions.cancel}
                                    </Text>
                                </Pressable>

                                <Pressable
                                    onPress={handleDelete}
                                    disabled={isDeleting}
                                    className="h-12 flex-1 items-center justify-center rounded-xl"
                                    style={({pressed}) => ({
                                        backgroundColor: pressed
                                            ? APP_COLORS.error
                                            : APP_COLORS.error,
                                        opacity: isDeleting ? 0.7 : 1,
                                    })}
                                >
                                    {isDeleting ? (
                                        <ActivityIndicator color="#FFFFFF"/>
                                    ) : (
                                        <Text
                                            className={`text-sm font-semibold text-white ${mmLeading}`}
                                            style={style}
                                        >
                                            {t.delete.actions.confirm}
                                        </Text>
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}
