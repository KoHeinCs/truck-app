import type {OwnershipRunningBalanceItem} from "@/stores/server/ownership/typed";
import {formatAmount} from "@/utils/amountUtil";
import React from "react";
import type {StyleProp, TextStyle} from "react-native";
import {Text, View} from "react-native";
import {APP_COLORS} from "@/constants/colors";
import {formatDateTime} from '@/utils/dateUtil'

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
                                                mmLeading
                                            }: OwnershipRunningBalanceCardProps) {

    const balance = item.balance ?? 0;
    const balanceClassName = balance < 0 ? "text-red-600" : "text-green-600";

    return (
        <View className="rounded-2xl border border-slate-100 bg-[#fbfcfe] p-3"
              style={{
                  backgroundColor: APP_COLORS.card,
                  borderColor: APP_COLORS.border,
                  borderWidth: 1
              }}
        >
            <View className="flex-row items-start justify-between gap-2">
                {/* proposal no. , proposal date */}
                <View className="flex-1">
                    <Text className={`text-sm font-bold ${mmLeading}`}
                          style={[style, {color: APP_COLORS.primary}]}
                    >
                        {item.proposalNo || "-"}
                    </Text>
                    <Text className={` text-xs text-slate-500 ${mmLeading}`} style={style}>
                        {formatDateTime(item.proposeDate)}
                    </Text>
                </View>

                {/* service type */}
                <View className="rounded-lg px-3 py-1"
                      style={{
                          backgroundColor: APP_COLORS.primarySoft,
                          borderColor: APP_COLORS.primary + 25
                      }}
                >
                    <Text
                        className={`text-xs font-semibold   ${mmLeading}`}
                        style={[style, {color: APP_COLORS.primary}]}
                    >
                        {item.serviceType || "-"}
                    </Text>
                </View>
            </View>

            <View className="mt-1 flex-row gap-2">
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
        <View className="flex-1 rounded-xl p-1"
              style={{
                  backgroundColor:APP_COLORS.card,
                  borderColor:APP_COLORS.border,
                  borderWidth:1
              }}
        >
            <Text
                className={`text-xs font-medium  ${mmLeading}`}
                style={[style,{color:APP_COLORS.textMuted}]}
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
