import type {OwnershipRunningBalanceItem} from "@/stores/server/ownership/typed";
import {formatAmount} from "@/utils/amountUtil";
import React, {useMemo} from "react";
import type {StyleProp, TextStyle} from "react-native";
import {Pressable, Text, View} from "react-native";
import {APP_COLORS} from "@/constants/colors";
import {formatDateTime} from '@/utils/dateUtil'
import {AppLocale} from "@/stores/client/locale-store";

type RunningBalanceLabels = {
    debit: string;
    credit: string;
    balance: string;
    currencySuffix: string;
};

type OwnershipRunningBalanceCardProps = {
    item: OwnershipRunningBalanceItem;
    labels: RunningBalanceLabels;
    style?: StyleProp<TextStyle>;
    mmLeading: any;
    resolveServiceTypeLabel: any;
    local: AppLocale;
    onPressProposal?: (proposalNo: string) => void;
};

function formatLocalizedAmount(
    value: number | null | undefined,
    suffix: string,
): string {
    return formatAmount(value ?? 0).replace(/\s*Ks$/, ` ${suffix}`);
}

export function OwnershipRunningBalanceCard({
                                                item,
                                                labels,
                                                style,
                                                mmLeading,
                                                resolveServiceTypeLabel,
                                                local,
                                                onPressProposal,
                                            }: OwnershipRunningBalanceCardProps) {

    const proposalNo = String(item.proposalNo ?? "").trim();
    const balance = item.balance ?? 0;
    const balanceClassName = balance < 0 ? "text-red-700" : "text-green-700";
    const serviceTypeLabel = useMemo(
        () => resolveServiceTypeLabel(item?.serviceType ?? "", local),
        [item?.serviceType, local, resolveServiceTypeLabel],
    );

    return (
        <View className="rounded-2xl p-3"
              style={{
                  backgroundColor: APP_COLORS.card,
                  borderColor: APP_COLORS.border,
                  borderWidth: 1
              }}
        >
            <View className="flex-row items-start justify-between gap-2">
                {/* proposal no. , proposal date */}
                <View className="flex-1">
                    {proposalNo && onPressProposal ? (
                        <Pressable
                            accessibilityRole="link"
                            onPress={() => onPressProposal(proposalNo)}
                            style={({pressed}) => ({opacity: pressed ? 0.7 : 1})}
                        >
                            <Text className={`text-sm font-bold ${mmLeading}`}
                                  style={[style, {color: APP_COLORS.primary}]}
                            >
                                {proposalNo}
                            </Text>
                        </Pressable>
                    ) : (
                        <Text className={`text-sm font-bold ${mmLeading}`}
                              style={[style, {color: APP_COLORS.primary}]}
                        >
                            {proposalNo || "-"}
                        </Text>
                    )}
                    <Text className={`text-xs font-medium  ${mmLeading}`}
                          style={[style, {color: APP_COLORS.textPrimary}]}>
                        {formatDateTime(item.proposeDate)}
                    </Text>
                </View>

                {/* service type */}
                <View className="rounded-lg px-3 py-2"
                      style={{
                          backgroundColor: APP_COLORS.primarySoft,
                          borderColor: APP_COLORS.primary + 25
                      }}
                >
                    <Text
                        className={`text-xs font-semibold   ${mmLeading}`}
                        style={[style, {color: APP_COLORS.primary}]}
                    >
                        {serviceTypeLabel || "-"}
                    </Text>
                </View>
            </View>

            <View className="mt-2 flex-row gap-2">
                <BalanceMetric
                    label={labels.debit}
                    value={formatLocalizedAmount(item.debit, labels.currencySuffix)}
                    mmLeading={mmLeading}
                    style={style}
                />
                <BalanceMetric
                    label={labels.credit}
                    value={formatLocalizedAmount(item.credit, labels.currencySuffix)}
                    mmLeading={mmLeading}
                    style={style}
                />
                <BalanceMetric
                    label={labels.balance}
                    value={formatLocalizedAmount(balance, labels.currencySuffix)}
                    mmLeading={mmLeading}
                    style={style}
                    valueClassName={balanceClassName}
                />
            </View>
        </View>
    );
}

type BalanceMetricProps = {
    label: string;
    value: string;
    style?: StyleProp<TextStyle>;
    valueClassName?: string;
    mmLeading: any;
};

function BalanceMetric({
                           label,
                           value,
                           style,
                           valueClassName = "text-slate-900",
                           mmLeading
                       }: BalanceMetricProps) {
    return (
        <View className="flex-1 rounded-xl p-1.5"
              style={{
                  backgroundColor: APP_COLORS.card,
                  borderColor: APP_COLORS.border,
                  borderWidth: 1
              }}
        >
            <Text
                className={`text-xs font-medium  ${mmLeading}`}
                style={[style, {color: APP_COLORS.textMuted}]}
            >
                {label}
            </Text>
            <Text
                className={`text-xs font-bold ${valueClassName} ${mmLeading}`}
                style={style}
            >
                {value}
            </Text>
        </View>
    );
}
