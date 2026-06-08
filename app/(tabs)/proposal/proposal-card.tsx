import {APP_COLORS} from "@/constants/colors";
import type {ProposalItem} from "@/stores/server/proposal/typed";
import Ionicons from "@expo/vector-icons/Ionicons";
import {Button, Card} from "heroui-native";
import React, {useState} from "react";
import {Pressable, Text, View} from "react-native";
import {useTranslation} from "@/hooks/use-translation";

type ProposalCardProps = {
    item: ProposalItem;
    onPressDetail: (item: ProposalItem) => void;
    onPressEdit: (item: ProposalItem) => void;
    mmLeading: any
};

function formatDateTime(value: string): string {
    if (!value) return "-";

    const normalized = value.includes("T") ? value : value.replace(" ", "T");
    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) return value;

    const dd = String(parsed.getDate()).padStart(2, "0");
    const mm = String(parsed.getMonth() + 1).padStart(2, "0");
    const yyyy = String(parsed.getFullYear());
    const hh = String(parsed.getHours()).padStart(2, "0");
    const min = String(parsed.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

function formatAmount(value: number): string {
    const safeValue = Number.isFinite(value) ? value : 0;
    return `${safeValue.toLocaleString()} Ks`;
}

export function ProposalCard(
    {
        item,
        onPressDetail,
        onPressEdit,
        mmLeading
    }: ProposalCardProps
) {

    const [expanded, setExpanded] = useState(false);
    const {card: t} = useTranslation('proposal')


    const canEdit = (item.status || "").toUpperCase() === "INFORM";

    return (
        <Pressable onPress={() => setExpanded((prev) => !prev)}>
            <Card className="mb-3">
                <Card.Body className="gap-2">

                    {/* proposal number , proposal date */}
                    <View className="flex-row items-center gap-2">
                        <View className="h-6 w-6 items-center justify-center rounded-full bg-slate-100">
                            <Ionicons
                                name={expanded ? "chevron-up" : "chevron-down"}
                                size={14}
                                color="#64748b"
                            />
                        </View>

                        <View className="flex-1">
                            <Text className={`text-sm font-bold text-primary ${mmLeading}`}>
                                {item.proposalNo}
                            </Text>
                            <Text className={`mt-0.5 text-xs text-slate-500 ${mmLeading}`}>
                                {formatDateTime(item.proposalDate)}
                            </Text>
                        </View>

                    </View>

                    {/* expanded form */}
                    {
                        expanded ?
                            (
                                <View className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-3">

                                    {/* plate number , proposal amount */}
                                    <View className="flex-row gap-4">

                                        <View className="flex-1">
                                            <Text className={`text-xs text-slate-500 ${mmLeading}`}>
                                                {t.plateNo}
                                            </Text>
                                            <Text
                                                className={`text-sm font-semibold text-slate-700 ${mmLeading}`}
                                            >
                                                {item.plateNo || "-"}
                                            </Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className={`text-xs text-slate-500 ${mmLeading}`}>
                                                {t.amount}
                                            </Text>
                                            <Text
                                                className={`text-sm font-semibold text-slate-700 ${mmLeading}`}
                                            >
                                                {formatAmount(item.proposalAmount) || "-"}
                                            </Text>
                                        </View>

                                    </View>

                                    {/* service type , service shop */}
                                    <View className="flex-row gap-4">

                                        <View className="flex-1">
                                            <Text className={`text-xs text-slate-500 ${mmLeading}`}>
                                                {t.serviceType}
                                            </Text>
                                            <Text
                                                className={`text-sm font-semibold text-slate-700 ${mmLeading}`}
                                            >
                                                {item.serviceType || "-"}
                                            </Text>
                                        </View>

                                        <View className="flex-1">
                                            <Text className={`text-xs text-slate-500 ${mmLeading}`}>
                                                {t.serviceShop}
                                            </Text>
                                            <Text
                                                className={`text-sm font-semibold text-slate-700 ${mmLeading}`}
                                            >
                                                {item.serviceShop || "-"}
                                            </Text>
                                        </View>

                                    </View>

                                    {/* created user , service date */}
                                    <View className="mt-2 flex-row gap-4">
                                        <View className="flex-1">
                                            <Text className={`text-xs text-slate-500 ${mmLeading}`}>
                                                {t.createdBy}
                                            </Text>
                                            <Text
                                                className={`text-sm font-semibold text-slate-700 ${mmLeading}`}
                                            >
                                                {item.createdBy || "-"}
                                            </Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className={`text-xs text-slate-500 ${mmLeading}`}>
                                                {t.serviceDate}
                                            </Text>
                                            <Text
                                                className={`text-sm font-semibold text-slate-700 ${mmLeading}`}
                                            >
                                                {formatDateTime(item.serviceDate)}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* details button , edit button */}
                                    <View className="mt-3 flex-row items-center gap-2">
                                        <Button
                                            onPress={() => onPressDetail(item)}
                                            className=" flex-1 bg-primary rounded-md "
                                            size="sm"
                                            variant="outline"
                                        >
                                            <Text
                                                className={`text-xs font-semibold text-white ${mmLeading}`}
                                            >
                                                {t.viewDetail}
                                            </Text>
                                        </Button>

                                        {canEdit ? (
                                            <Button
                                                onPress={() => onPressEdit(item)}
                                                size="sm"
                                                variant="outline"
                                                className=" w-10 p-0 items-center justify-center rounded-xl border border-slate-200 bg-white"
                                            >
                                                <Ionicons
                                                    name="create-outline"
                                                    size={18}
                                                    color={APP_COLORS.primary}
                                                />
                                            </Button>
                                        ) : null}
                                    </View>

                                </View>
                            )
                            : null
                    }

                </Card.Body>
            </Card>
        </Pressable>
    );
}
