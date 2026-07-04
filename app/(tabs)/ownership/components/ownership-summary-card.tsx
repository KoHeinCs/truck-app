import {APP_COLORS} from "@/constants/colors";
import {
    getMyanmarLeadingClass,
    myanmarUITextStyle,
} from "@/constants/myanmar-font";
import type {AppLocale} from "@/stores/client/locale-store";
import type {OwnershipItem} from "@/stores/server/ownership/typed";
import {formatAmount} from "@/utils/amountUtil";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import type {StyleProp, TextStyle} from "react-native";
import {Text, View} from "react-native";

type OwnershipSummaryLabels = {
    profitLoss: string;
    totalCost: string;
    totalIncome: string;
    notes: string;
    currencySuffix: string;
};

type OwnershipSummaryCardProps = {
    item: OwnershipItem | null | undefined;
    locale: AppLocale;
    labels: OwnershipSummaryLabels;
    style?: StyleProp<TextStyle>;
    mmLeading: any;
};

function formatLocalizedAmount(
    value: number | null | undefined,
    suffix: string,
): string {
    return formatAmount(value ?? 0).replace(/\s*Ks$/, ` ${suffix}`);
}

function valueText(value: unknown): string {
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
}

export function OwnershipSummaryCard({
                                         item,
                                         locale,
                                         labels,
                                         style,
                                         mmLeading
                                     }: OwnershipSummaryCardProps) {


    const title = valueText(item?.equipmentName);
    const licenseCity = valueText(item?.licenseCity);
    const plateNo = valueText(item?.truckPlateNo);
    const profit = item?.profit ?? 0;
    const profitClassName = profit < 0 ? "text-red-600" : "text-slate-900";

    return (
        <View
            className="mt-1 rounded-2xl p-4"
            style={{
                backgroundColor: APP_COLORS.card,
                borderColor: APP_COLORS.border,
                borderWidth: 1,
            }}
        >

            <View className="flex-row items-start justify-between gap-3">
                {/* equipment name , license city ,  plate no. */}
                <View className="flex-1">
                    <Text
                        className={`text-base font-bold  ${mmLeading}`}
                        style={[style,{color:APP_COLORS.textPrimary}]}
                    >
                        {title}
                    </Text>
                    <View className="flex-row items-center gap-1">
                        <Ionicons name="location-outline" size={14} color={APP_COLORS.primary}/>
                        <Text className={`text-xs font-medium ${mmLeading}`} style={[style,{color:APP_COLORS.primary}]}>
                            {licenseCity} • {plateNo}
                        </Text>
                    </View>
                </View>

                {/* profit / loss */}
                <View className="items-end">
                    <Text className={`text-xs font-medium  ${mmLeading}`}
                          style={[style,{color:APP_COLORS.textMuted}]}>
                        {labels.profitLoss}
                    </Text>
                    <Text
                        className={`text-sm font-bold ${profitClassName} ${mmLeading}`}
                        style={[style,{color:APP_COLORS.textPrimary}]}
                    >
                        {formatLocalizedAmount(profit, labels.currencySuffix)}
                    </Text>
                </View>
            </View>

            {/* total cost , total income */}
            <View className="mt-4 flex-row gap-3 border-t border-slate-100 pt-3">
                <SummaryMetric
                    label={labels.totalCost}
                    value={formatLocalizedAmount(item?.totalCost, labels.currencySuffix)}
                    style={style}
                    mmLeading={mmLeading}
                />
                <SummaryMetric
                    label={labels.totalIncome}
                    value={formatLocalizedAmount(item?.totalIncome, labels.currencySuffix)}
                    style={style}
                    mmLeading={mmLeading}
                />
            </View>

            {/* notes */}
            <View className="mt-3 rounded-xl border border-slate-100 bg-[#f8fafc] p-3"
                  style={{
                      backgroundColor:APP_COLORS.background,
                      borderColor:APP_COLORS.border,
                      borderWidth:1
                  }}
            >
                <Text className={`text-xs font-medium ${mmLeading}`} style={[style,{color:APP_COLORS.textMuted}]}>
                    {labels.notes}
                </Text>
                <Text
                    className={` text-sm font-normal ${mmLeading}`}
                    style={[style,{color:APP_COLORS.textPrimary}]}
                >
                    {valueText(item?.notes)}
                </Text>
            </View>
        </View>
    );
}

type SummaryMetricProps = {
    label: string;
    value: string;
    style?: StyleProp<TextStyle>;
    mmLeading: any;
};

function SummaryMetric({label, value, style,mmLeading}: SummaryMetricProps) {
    return (
        <View className="flex-1">
            <Text className={`text-xs font-medium ${mmLeading}`} style={[style,{color:APP_COLORS.textMuted}]}>
                {label}
            </Text>
            <Text
                className={`text-sm font-bold ${mmLeading}`}
                style={[style,{color:APP_COLORS.textPrimary}]}
            >
                {value}
            </Text>
        </View>
    );
}
