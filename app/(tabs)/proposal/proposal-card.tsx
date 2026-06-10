import {APP_COLORS} from "@/constants/colors";
import type {ProposalItem} from "@/stores/server/proposal/typed";
import Ionicons from "@expo/vector-icons/Ionicons";
import {Button, Card} from "heroui-native";
import React, {useState} from "react";
import {Pressable, Text, View} from "react-native";
import {useTranslation} from "@/hooks/use-translation";
import {formatDate, formatDateTime} from "@/utils/dateUtil";
import {formatAmount} from "@/utils/amountUtil";


type ProposalCardProps = {
    item: ProposalItem;
    onPressDetail: (item: ProposalItem) => void;
    onPressEdit: (item: ProposalItem) => void;
    mmLeading: any;
};

export function ProposalCard(
    {
        item,
        onPressDetail,
        onPressEdit,
        mmLeading,
    }: ProposalCardProps
) {

    const [expanded, setExpanded] = useState(false);
    const {card: t} = useTranslation('proposal')

    const canEdit = (item.status || "").toUpperCase() === "INFORM";

    return (
        <Pressable
            onPress={() => setExpanded((prev) => !prev)}
        >
            <Card
                className="mb-3"
                style={{
                    backgroundColor: APP_COLORS.card,
                    borderColor: APP_COLORS.border,
                    borderWidth: 1,
                }}
            >
                <Card.Body className="p-0 gap-2">

                    {/* proposal number , proposal date */}
                    <View className="flex-row items-center gap-x-2">

                        <View className="h-6 w-6 items-center justify-center rounded-full">
                            <Ionicons
                                name={expanded ? "chevron-up" : "chevron-down"}
                                size={22}
                                color={APP_COLORS.primary}
                            />
                        </View>

                        <View className="flex-1">
                            <Text
                                className={`text-xs font-bold ${mmLeading}`}
                                style={[{color: APP_COLORS.primary}]}
                                numberOfLines={1}
                            >
                                {item.proposalNo}
                            </Text>
                            <Text
                                className={`mt-0.5 text-xs font-semibold ${mmLeading}`}
                                style={[{color: APP_COLORS.textMuted}]}
                            >
                                {formatDate(item.proposalDate)}
                            </Text>
                        </View>

                    </View>

                    {/* expanded form */}
                    {
                        expanded ?
                            (
                                <View
                                    className="rounded-2xl border border-slate-200  p-3"
                                    style={{backgroundColor:APP_COLORS.inputBackground}}
                                >

                                    {/* plate number , proposal amount */}
                                    <View className="flex-row gap-4">

                                        <View className="flex-1 min-w-0">
                                            <Text
                                                className={`text-[11px] font-medium ${mmLeading}`}
                                                style={{color: APP_COLORS.textMuted}}
                                            >
                                                {t.plateNo}
                                            </Text>
                                            <Text
                                                className={`text-xs font-semibold  ${mmLeading}`}
                                                style={{color: APP_COLORS.textSecondary}}
                                                numberOfLines={1}
                                                ellipsizeMode={"tail"}

                                            >
                                                {item.plateNo || "-"}
                                            </Text>
                                        </View>

                                        <View className="flex-1 min-w-0">
                                            <Text
                                                className={`text-[11px] font-medium ${mmLeading}`}
                                                style={{color: APP_COLORS.textMuted}}
                                            >
                                                {t.amount}
                                            </Text>
                                            <Text
                                                className={`text-xs font-semibold  ${mmLeading}`}
                                                style={{color: APP_COLORS.textSecondary}}
                                                numberOfLines={1}
                                                ellipsizeMode={"tail"}
                                            >
                                                {formatAmount(item.proposalAmount) || "-"}
                                            </Text>
                                        </View>

                                    </View>

                                    {/* service type , service shop */}
                                    <View className="mt-2  flex-row gap-4">

                                        <View className="flex-1 min-w-0">
                                            <Text
                                                className={`text-[11px] font-medium ${mmLeading}`}
                                                style={{color:APP_COLORS.textMuted}}
                                            >
                                                {t.serviceType}
                                            </Text>
                                            <Text
                                                className={`text-xs font-semibold  ${mmLeading}`}
                                                style={{color:APP_COLORS.textSecondary}}
                                                numberOfLines={2}
                                                ellipsizeMode={"clip"}
                                            >
                                                {item.serviceType || "-"}
                                            </Text>
                                        </View>

                                        <View className="flex-1 min-w-0">
                                            <Text className={`text-[11px] font-medium  ${mmLeading}`} style={{color: APP_COLORS.textMuted}} >
                                                {t.serviceShop}
                                            </Text>
                                            <Text
                                                className={`text-xs font-semibold  ${mmLeading}`}
                                                style={{color: APP_COLORS.textSecondary}}
                                                numberOfLines={2}
                                                ellipsizeMode={"tail"}
                                            >
                                                {item.serviceShop || "-"}
                                            </Text>
                                        </View>

                                    </View>

                                    {/* created user , service date */}
                                    <View className="mt-2 flex-row gap-4">

                                        <View className="flex-1 min-w-0">
                                            <Text
                                                className={`text-[11px] font-medium ${mmLeading}`}
                                                style={{color:APP_COLORS.textMuted}}
                                                numberOfLines={1}
                                            >
                                                {t.serviceDate}
                                            </Text>
                                            <Text
                                                className={`text-xs font-semibold  ${mmLeading}`}
                                                style={{color:APP_COLORS.textSecondary}}
                                                numberOfLines={2}
                                                ellipsizeMode={"clip"}
                                            >
                                                {formatDateTime(item.serviceDate)}
                                            </Text>
                                        </View>

                                        <View className="flex-1 min-w-0">
                                            <Text
                                                className={`text-[11px] font-medium ${mmLeading}`}
                                                style={{color:APP_COLORS.textMuted}}
                                            >
                                                {t.createdBy}
                                            </Text>
                                            <Text
                                                className={`text-xs font-semibold  ${mmLeading}`}
                                                style={{color:APP_COLORS.textSecondary}}
                                                numberOfLines={1}
                                                ellipsizeMode={"tail"}
                                            >
                                                {item.createdBy || "-"}
                                            </Text>
                                        </View>

                                    </View>

                                    {/* details button , edit button */}
                                    <View className="mt-5 flex-row items-center gap-2">
                                        <Button
                                            onPress={() => onPressDetail(item)}
                                            className=" flex-1 bg-primary rounded-md "
                                            size="sm"
                                            variant="outline"
                                        >
                                            <Text
                                                className={`text-sm font-semibold text-white ${mmLeading}`}
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
                                                    size={22}
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
