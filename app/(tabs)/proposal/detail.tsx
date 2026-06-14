import {CompactTextInput} from "@/components/compact-text-input";
import {APP_COLORS, getStatusBadgeStyle} from "@/constants/colors";
import {getMyanmarLeadingClass, myanmarUITextStyle} from "@/constants/myanmar-font";
import {useTranslation} from "@/hooks/use-translation";
import {getApiErrorAlertCopy} from "@/lib/api-error-alert";
import {useLocaleStore} from "@/stores/client/locale-store";
import {useApproveProposal} from "@/stores/server/proposal/approve-mutation";
import {
    useProposalDetail,
    useProposalHistory,
} from "@/stores/server/proposal/query";
import {useTerminateProposal} from "@/stores/server/proposal/terminate-mutation";
import type {
    ProposalDetail,
    ProposalHistoryItem,
} from "@/stores/server/proposal/typed";
import {normalizeServiceDateForApi} from "@/utils/service-date";
import Ionicons from "@expo/vector-icons/Ionicons";
import {useQueryClient} from "@tanstack/react-query";
import {useLocalSearchParams, useRouter} from "expo-router";
import {Button} from "heroui-native";
import React, {useCallback, useMemo, useState} from "react";
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
import {formatDateTime,formatDate} from "@/utils/dateUtil"
import {formatAmount} from "@/utils/amountUtil"


function getOwnershipId(
    detail: ProposalDetail | undefined,
    fallback: string,
): string {
    return String(detail?.ownershipRefId ?? fallback).trim();
}

function handleNotes(notes:any){
    if (!notes || typeof notes !== 'string') return '';

    return notes.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/g, (match) => {
        const date = new Date(match + 'Z');
        return date.toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'UTC'
        });
    });

}

export default function ProposalDetailScreen() {

    const router = useRouter();
    const qc = useQueryClient();
    const insets = useSafeAreaInsets();
    const locale = useLocaleStore((state) => state.locale);
    const mmLeading = getMyanmarLeadingClass(locale);
    const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
    const style = locale === "mm" ? mmTextStyle : undefined;
    const errorCatalog = useTranslation("error");
    const {detailProposal: t} = useTranslation('proposal')
    const {actionStatus : tActionStatus } = useTranslation('lookup')
    const params = useLocalSearchParams<{
        proposalNo?: string;
        ownershipId?: string;
    }>();
    const proposalNo = String(params.proposalNo ?? "").trim();
    const ownershipId = String(params.ownershipId ?? "").trim();
    const {data, isPending} = useProposalDetail(proposalNo, ownershipId);
    const {data: historyData} = useProposalHistory(proposalNo, ownershipId);
    const detail = data?.data;
    const histories = historyData?.data ?? [];
    const {mutate: approveProposal, isPending: isApproving} = useApproveProposal();
    const {mutate: terminateProposal, isPending: isTerminating} = useTerminateProposal();
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [terminateModalOpen, setTerminateModalOpen] = useState(false);
    const [approveRemark, setApproveRemark] = useState("");
    const [terminateRemark, setTerminateRemark] = useState("");
    const showActions = (detail?.status || "").toUpperCase() === "INFORM";
    const isSubmitting = isApproving || isTerminating;

    const onBack = useCallback(() => {
        qc.invalidateQueries({queryKey: ["proposal"]});
        router.back();
    }, [qc, router]);

    const closeApproveModal = useCallback(() => {
        setApproveModalOpen(false);
        setApproveRemark("");
    }, []);

    const closeTerminateModal = useCallback(() => {
        setTerminateModalOpen(false);
        setTerminateRemark("");
    }, []);

    const handleApprove = useCallback(() => {
        if (!detail?.id) return;

        approveProposal(
            {
                id: detail.id,
                version: detail.version,
                ownershipId: getOwnershipId(detail, ownershipId),
                proposalAmount: detail.proposalAmount,
                serviceType: detail.serviceType,
                serviceDate: normalizeServiceDateForApi(detail.serviceDate),
                remark: approveRemark.trim() || undefined,
            },
            {
                onSuccess: () => {
                    closeApproveModal();
                    Alert.alert(t.dialog.approveSuccessTitle, t.dialog.approveSuccessBody, [
                        {text: t.labels.done, onPress: () => router.back()},
                    ]);
                },
                onError: (err: unknown) => {
                    const {title, message} = getApiErrorAlertCopy(err, errorCatalog, {
                        title: t.dialog.errorTitle,
                        message: t.dialog.errorBody,
                    });
                    Alert.alert(title, message);
                },
            },
        );
    }, [
        approveProposal,
        closeApproveModal,
        t.labels.done,
        detail,
        errorCatalog,
        ownershipId,
        approveRemark,
        router,
        t.dialog.approveSuccessBody,
        t.dialog.approveSuccessTitle,
        t.dialog.errorBody,
        t.dialog.errorTitle,
    ]);

    const handleTerminate = useCallback(() => {
        if (!detail?.id) return;

        const trimmedRemark = terminateRemark.trim();
        if (!trimmedRemark) {
            Alert.alert(t.dialog.errorTitle, t.required);
            return;
        }

        terminateProposal(
            {
                id: detail.id,
                ownershipId: getOwnershipId(detail, ownershipId),
                remark: trimmedRemark,
            },
            {
                onSuccess: () => {
                    closeTerminateModal();
                    Alert.alert(t.dialog.terminateSuccessTitle, t.dialog.terminateSuccessBody, [
                        {text: t.labels.done, onPress: () => router.back()},
                    ]);
                },
                onError: (err: unknown) => {
                    const {title, message} = getApiErrorAlertCopy(err, errorCatalog, {
                        title: t.dialog.errorTitle,
                        message: t.dialog.errorBody,
                    });
                    Alert.alert(title, message);
                },
            },
        );
    }, [
        closeTerminateModal,
        t.labels.done,
        t.required,
        detail,
        errorCatalog,
        ownershipId,
        router,
        t.dialog.errorBody,
        t.dialog.errorTitle,
        t.dialog.terminateSuccessBody,
        t.dialog.terminateSuccessTitle,
        terminateProposal,
        terminateRemark,
    ]);

    return (
        <SafeAreaView style={{backgroundColor: APP_COLORS.background, flex: 1}}>

            {/* back button , page title */}
            <View className="flex-row items-center px-4 pb-3 pt-1">
                <Pressable
                    onPress={onBack}
                    className="h-11 w-11 items-center justify-center rounded-full "
                    style={({pressed}) => ({
                        backgroundColor: pressed ? APP_COLORS.primary : APP_COLORS.background
                    })}>
                    <Ionicons name="arrow-back" size={22} color="#475569"/>
                </Pressable>
                <Text
                    className={`flex-1 px-3 text-center text-lg font-bold ${mmLeading}`}
                    style={[style, {color: APP_COLORS.textPrimary}]}>
                    {t.title}
                </Text>
                <View className="h-11 w-11"/>
            </View>

            {/* details form */}
            {
                isPending ?
                    (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator color={APP_COLORS.primary}/>
                        </View>
                    ) :
                    (
                        <ScrollView
                            className="px-4"
                            contentContainerStyle={{
                                paddingBottom: insets.bottom + 24,
                                flexGrow: 1,
                            }}
                        >

                            {/* details form */}
                            <View
                                className="mt-1 rounded-2xl  p-4"
                                style={{
                                    backgroundColor: APP_COLORS.card,
                                    borderColor: APP_COLORS.border,
                                    borderWidth: 1
                                }}
                            >

                                {/* proposal number && proposal status */}
                                <View className="flex-row items-start justify-between gap-2">
                                    <View className="flex-1">
                                        <Text
                                            className={`text-xl font-bold tracking-tight  ${mmLeading}`}
                                            style={[style, {color: APP_COLORS.primary}]}
                                            numberOfLines={1}
                                        >
                                            {detail?.proposalNo || "-"}
                                        </Text>
                                    </View>
                                    <View
                                        className="rounded-xl  px-3 py-1.5"
                                        style={{
                                            backgroundColor: getStatusBadgeStyle(detail?.status ?? "INFORM").backgroundColor,
                                            borderColor: getStatusBadgeStyle(detail?.status ?? "INFORM").borderColor
                                        }}
                                    >
                                        <Text
                                            className={`text-sm font-semibold uppercase  ${mmLeading}`}
                                            style={[
                                                {color: getStatusBadgeStyle(detail?.status ?? "INFORM").textColor}, style
                                            ]}
                                        >
                                            {tActionStatus[(detail?.status ?? "INFORM") as keyof typeof tActionStatus]}
                                        </Text>
                                    </View>
                                </View>

                                {/* proposal details form */}
                                <View className="mt-5 gap-y-3">

                                    {/* truck  plate no */}
                                    <View className="flex-row items-center justify-between gap-x-4">
                                        <Text
                                            className={`text-sm font-medium ${mmLeading}`}
                                            style={[style, {color: APP_COLORS.textMuted}]}
                                        >
                                            {t.labels.truck}
                                        </Text>
                                        <Text
                                            className={`text-base font-semibold  ${mmLeading}`}
                                            style={[style, {color: APP_COLORS.textSecondary}]}
                                        >
                                            {detail?.plateNo || "-"}
                                        </Text>
                                    </View>

                                    <View className="h-[0.5px]" style={{backgroundColor: APP_COLORS.border}}/>

                                    {/* amount */}
                                    <View className="flex-row items-center justify-between gap-x-4">
                                        <Text
                                            className={`text-sm font-medium ${mmLeading}`}
                                            style={[style, {color: APP_COLORS.textMuted}]}
                                        >
                                            {t.labels.amount}
                                        </Text>
                                        <Text
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                            className={`text-2xl font-bold tracking-tight ${mmLeading}`}
                                            style={[
                                                style,
                                                {color: APP_COLORS.textPrimary}
                                            ]}
                                        >
                                            {formatAmount(Number(detail?.proposalAmount ?? 0))}
                                        </Text>
                                    </View>

                                    <View className="h-[0.5px]" style={{backgroundColor: APP_COLORS.border}}/>

                                    {/* service type */}
                                    <View className="flex-row items-center justify-between gap-x-4">
                                        <Text
                                            className={`text-sm font-medium ${mmLeading}`}
                                            style={[style, {color: APP_COLORS.textMuted}]}
                                        >
                                            {t.labels.serviceType}
                                        </Text>
                                        <Text
                                            className={`text-sm font-semibold  ${mmLeading}`}
                                            style={[
                                                style,
                                                {color: APP_COLORS.textPrimary}
                                            ]}
                                        >
                                            {detail?.serviceType || "-"}
                                        </Text>
                                    </View>

                                    <View className="h-[0.5px]" style={{backgroundColor: APP_COLORS.border}}/>

                                    {/* service shop */}
                                    <View className="flex-row items-center justify-between gap-x-4">
                                        <Text
                                            className={`text-sm font-medium ${mmLeading}`}
                                            style={[style, {color: APP_COLORS.textMuted}]}
                                        >
                                            {t.labels.serviceShop}
                                        </Text>
                                        <Text
                                            className={`text-sm font-semibold  ${mmLeading}`}
                                            style={[style, {color: APP_COLORS.textPrimary}]}
                                        >
                                            {detail?.serviceShop || "-"}
                                        </Text>
                                    </View>

                                    <View className="h-[0.5px]" style={{backgroundColor: APP_COLORS.border}}/>

                                    {/* service date */}
                                    <View className="flex-row items-center justify-between gap-x-4">
                                        <Text
                                            className={`text-sm font-medium ${mmLeading}`}
                                            style={[style, {color: APP_COLORS.textMuted}]}
                                        >
                                            {t.labels.serviceDate}
                                        </Text>
                                        <Text
                                            className={`text-sm font-semibold  ${mmLeading}`}
                                            style={[style, {color: APP_COLORS.textPrimary}]}
                                        >
                                            {formatDateTime(detail?.serviceDate || "")}
                                        </Text>
                                    </View>

                                    <View className="h-[0.5px]" style={{backgroundColor: APP_COLORS.border}}/>

                                    {/* proposal date */}
                                    <View className="flex-row items-center justify-between gap-x-4">
                                        <Text
                                            className={`text-sm font-medium ${mmLeading}`}
                                            style={[style, {color: APP_COLORS.textMuted}]}
                                        >
                                            {t.labels.proposalDate}
                                        </Text>
                                        <Text
                                            className={`text-sm font-semibold  ${mmLeading}`}
                                            style={[style, {color: APP_COLORS.textPrimary}]}

                                        >
                                            {formatDate(detail?.proposalDate || "")}
                                        </Text>
                                    </View>

                                    <View className="h-[0.5px]" style={{backgroundColor: APP_COLORS.border}}/>

                                    {/* created user && his phone number */}
                                    <View className="flex-row items-center justify-between gap-x-4">
                                        <Text
                                            className={`text-sm font-medium ${mmLeading}`}
                                            style={[style, {color: APP_COLORS.textMuted}]}
                                        >
                                            {t.labels.createdBy}
                                        </Text>
                                        <View className="items-end">
                                            <Text
                                                className={`text-sm font-semibold ${mmLeading}`}
                                                style={[style, {color: APP_COLORS.textPrimary}]}

                                            >
                                                {detail?.createdUserFullName || detail?.createdBy || "-"}
                                            </Text>
                                            {detail?.createdUserPhone ? (
                                                <Text
                                                    className={`mt-0.5 text-xs  ${mmLeading}`}
                                                    style={[style, {color: APP_COLORS.textSecondary}]}

                                                >
                                                    {detail.createdUserPhone}
                                                </Text>
                                            ) : null}
                                        </View>
                                    </View>

                                    <View className="h-[0.5px]" style={{backgroundColor: APP_COLORS.border}}/>

                                    {/* owner && his phone number */}
                                    <View className="flex-row items-center justify-between gap-x-4">
                                        <Text
                                            className={`text-sm font-medium ${mmLeading}`}
                                            style={[style, {color: APP_COLORS.textMuted}]}
                                        >
                                            {t.labels.ownerId}
                                        </Text>
                                        <View className="items-end">
                                            <Text
                                                className={`text-sm font-semibold  ${mmLeading}`}
                                                style={[style, {color: APP_COLORS.textPrimary}]}
                                            >
                                                {detail?.ownerFullName || "-"}
                                            </Text>
                                            {detail?.ownerPhone ? (
                                                <Text
                                                    className={`mt-0.5 text-xs  ${mmLeading}`}
                                                    style={[style, {color: APP_COLORS.textSecondary}]}
                                                >
                                                    {detail.ownerPhone}
                                                </Text>
                                            ) : null}
                                        </View>
                                    </View>

                                    <View className="h-[0.5px]" style={{backgroundColor: APP_COLORS.border}}/>

                                    {/* description */}
                                    <View>
                                        <Text
                                            className={`text-sm font-medium ${mmLeading}`}
                                            style={[style, {color: APP_COLORS.textMuted}]}
                                        >
                                            {t.labels.description}
                                        </Text>
                                        <Text
                                            className={`rounded-xl border border-slate-200 bg-[#f8fafc] p-3 text-sm text-slate-700 ${mmLeading}`}
                                        >
                                            {detail?.description || "-"}
                                        </Text>
                                    </View>

                                </View>

                            </View>

                            {/* action histories */}
                            {
                                histories.length > 0 ?
                                    (
                                        <View
                                            className="mt-5 rounded-2xl  p-4"
                                            style={{
                                                backgroundColor: APP_COLORS.card,
                                                borderColor: APP_COLORS.border,
                                                borderWidth: 1
                                            }}
                                        >
                                            <Text
                                                className={`text-base font-bold text-slate-900 ${mmLeading}`}
                                                style={[style]}
                                            >
                                                {t.actionHistoryTitle}
                                            </Text>
                                            <View className="mt-4 gap-3">
                                                {histories.map((history) => (
                                                    <ProposalHistoryCard
                                                        key={history.id}
                                                        labels={t.labels}
                                                        item={history}
                                                        mmLeading={mmLeading}
                                                        style={style}
                                                        tActionStatus = {tActionStatus}
                                                    />
                                                ))}
                                            </View>
                                        </View>
                                    ) : null
                            }

                            {/* terminate && approve buttons */}
                            {
                                showActions ?
                                    (
                                        <View className="mb-2 mt-5 flex-row items-center w-full gap-3">
                                            <Button
                                                isDisabled={isSubmitting}
                                                onPress={() => setTerminateModalOpen(true)}
                                                variant="outline"
                                                className=" w-1/2 rounded-md "
                                                animation={{
                                                    highlight: {
                                                        backgroundColor: {
                                                            value: APP_COLORS.errorSoft, // Safely injects #456385 on click!
                                                        }
                                                    },
                                                }}
                                                style={{
                                                    backgroundColor: 'transparent',
                                                }}
                                            >
                                                <Text
                                                    className={`text-sm font-semibold  ${mmLeading}`}
                                                    style={[style, {color: APP_COLORS.error}]}
                                                >
                                                    {t.actions.terminate}
                                                </Text>
                                            </Button>

                                            <Button
                                                isDisabled={isSubmitting}
                                                onPress={() => setApproveModalOpen(true)}
                                                className="  w-1/2 rounded-md "
                                                animation={{
                                                    highlight: {
                                                        backgroundColor: {
                                                            value: APP_COLORS.primaryPressed, // Safely injects #456385 on click!
                                                        }
                                                    },
                                                }}
                                                style={{
                                                    backgroundColor: APP_COLORS.primary
                                                }}
                                            >
                                                <Text
                                                    className={`text-sm font-semibold  ${mmLeading}`}
                                                    style={[style, {color: APP_COLORS.card}]}
                                                >
                                                    {t.actions.approve}
                                                </Text>
                                            </Button>
                                        </View>
                                    ) : null
                            }
                        </ScrollView>
                    )
            }

            {/* approve modal */}
            <Modal
                visible={approveModalOpen}
                transparent
                animationType="fade"
                onRequestClose={closeApproveModal}
            >
                <Pressable
                    className="flex-1 items-center justify-center bg-black/40 px-6"
                    onPress={closeApproveModal}
                >
                    <Pressable
                        className="w-full rounded-2xl bg-white p-5"
                        onPress={(event) => event.stopPropagation()}
                    >
                        <Text className={`text-lg font-bold text-slate-900 ${mmLeading}`}>
                            {detail?.proposalNo || "-"}
                        </Text>

                        <Text className={`mb-2 mt-4 text-xs text-slate-500 ${mmLeading}`}>
                            {t.labels.remark}{locale === 'mm' ? ' (မထည့်လည်းရ)' : ' (Optional)'}
                        </Text>
                        <CompactTextInput
                            locale={locale}
                            compactVariant="advanced"
                            value={approveRemark}
                            onChangeText={setApproveRemark}
                            placeholder={t.placeholders.approvedRemark}
                            multiline
                            numberOfLines={4}
                            className="min-h-[96px] border border-slate-200 bg-white px-3 py-2 text-sm"
                        />

                        <View className="mt-4 flex-row gap-2">
                            <Button
                                isDisabled={isSubmitting}
                                onPress={closeApproveModal}
                                className="flex-1 items-center justify-center rounded-xl bg-slate-100 py-3"
                            >
                                <Text
                                    className={`text-sm font-semibold text-slate-700 ${mmLeading}`}
                                >
                                    {t.actions.cancel}
                                </Text>
                            </Button>

                            <Pressable
                                disabled={isSubmitting}
                                onPress={handleApprove}
                                className="flex-1 items-center justify-center rounded-xl py-3"
                                style={{backgroundColor: APP_COLORS.primary}}
                            >
                                {isApproving ? (
                                    <ActivityIndicator color="#fff"/>
                                ) : (
                                    <Text
                                        className={`text-sm font-semibold text-white ${mmLeading}`}
                                    >
                                        {t.actions.approve}
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* terminate modal */}
            <Modal
                visible={terminateModalOpen}
                transparent
                animationType="fade"
                onRequestClose={closeTerminateModal}
            >
                <Pressable
                    className="flex-1 items-center justify-center bg-black/40 px-6"
                    onPress={closeTerminateModal}
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
                            <Text className={`text-lg font-bold text-[#dc4c4c] ${mmLeading}`}>
                                {detail?.proposalNo || "-"}
                            </Text>
                        </View>

                        <View className="p-5">
                            <Text className={`mb-2 text-xs text-slate-500 ${mmLeading}`}>
                                {t.labels.remark}
                            </Text>
                            <CompactTextInput
                                locale={locale}
                                compactVariant="advanced"
                                value={terminateRemark}
                                onChangeText={setTerminateRemark}
                                placeholder={t.placeholders.terminatedRemark}
                                multiline
                                numberOfLines={4}
                                className="min-h-[96px] border bg-white px-3 py-2 text-sm"
                                style={{borderColor: APP_COLORS.errorSoft}}
                            />

                            <View className="mt-4 flex-row gap-2">
                                <Pressable
                                    disabled={isSubmitting}
                                    onPress={closeTerminateModal}
                                    className="flex-1 items-center justify-center rounded-xl bg-slate-100 py-3"
                                >
                                    <Text
                                        className={`text-sm font-semibold text-slate-700 ${mmLeading}`}
                                    >
                                        {t.actions.cancel}
                                    </Text>
                                </Pressable>

                                <Pressable
                                    disabled={isSubmitting}
                                    onPress={handleTerminate}
                                    className="flex-1 items-center justify-center rounded-xl py-3"
                                    style={{backgroundColor: APP_COLORS.error}}
                                >
                                    {isTerminating ? (
                                        <ActivityIndicator color="#fff"/>
                                    ) : (
                                        <Text
                                            className={`text-sm font-semibold text-white ${mmLeading}`}
                                        >
                                            {t.actions.terminate}
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

type HistoryLabels = {
    remark: string;
    notes: string;
};

type ProposalHistoryCardProps = {
    item: ProposalHistoryItem;
    labels: HistoryLabels;
    mmLeading: string;
    style: any,
    tActionStatus:any
};

function ProposalHistoryCard(
    {
        labels,
        item,
        mmLeading,
        style,
        tActionStatus
    }: ProposalHistoryCardProps
) {
    const remark = String(item.remark ?? "").trim();
    const notes = String(item.notes ?? "").trim();

    return (
        <View
            className="rounded-2xl border border-slate-100 bg-[#fbfcfe] p-3"
            style={{
                backgroundColor: APP_COLORS.card,
                borderColor: APP_COLORS.border,
                borderWidth: 1
            }}
        >
            <View className="flex-row items-start gap-3">

                {/* person icon */}
                <View className="h-9 w-9 items-center justify-center rounded-full border border-slate-100 bg-white">
                    <Ionicons name="person-outline" size={22} color="#64748b"/>
                </View>

                {/* action history details */}
                <View className="flex-1">
                    <View className="flex-row items-start justify-between gap-2">

                        {/* actor name , created date */}
                        <View className="flex-1">
                            <Text className={`text-sm font-bold text-slate-700 ${mmLeading}`}>
                                {item.actorName || "-"}
                            </Text>
                            <Text className={`mt-0.5 text-xs text-slate-500 ${mmLeading}`}>
                                {formatDateTime(item.createdAt)}
                            </Text>
                        </View>

                        {/* action status */}
                        <View
                            className={`rounded-lg border px-3 py-1`}
                            style={{
                                backgroundColor: getStatusBadgeStyle(item.action).backgroundColor,
                                borderColor: getStatusBadgeStyle(item.action).borderColor,
                            }}

                        >
                            <Text
                                className={`text-xs font-bold uppercase tracking-wide  ${mmLeading}`}
                                style={[{color: getStatusBadgeStyle(item.action).textColor}, style]}
                            >
                                {tActionStatus[(item.action ?? "INFORM") as keyof typeof tActionStatus]}
                            </Text>
                        </View>

                    </View>

                    {remark ? (
                        <View className="mt-3 rounded-xl border border-slate-100 bg-white p-3">
                            <Text
                                className={`text-sm font-medium ${mmLeading}`}
                                style={[style,{color:APP_COLORS.textMuted}]}
                            >
                                {labels.remark}
                            </Text>
                            <Text
                                className={`mt-1 text-sm font-medium  ${mmLeading}`}
                                style={[style,{color:APP_COLORS.textPrimary}]}
                            >
                                {remark}
                            </Text>
                        </View>
                    ) : null}

                    {notes ? (
                        <View className="mt-3 rounded-xl border border-slate-100 bg-white p-3">
                            <Text
                                className={`text-sm font-medium ${mmLeading}`}
                                style={[style,{color:APP_COLORS.textMuted}]}
                            >
                                {labels.notes}
                            </Text>
                            <Text
                                className={`mt-1 text-sm font-medium ${mmLeading}`}
                                style={[style,{color:APP_COLORS.textPrimary}]}
                            >
                                {handleNotes(notes)}
                            </Text>
                        </View>
                    ) : null}
                </View>
            </View>
        </View>
    );
}
