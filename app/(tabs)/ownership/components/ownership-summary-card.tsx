import {APP_COLORS} from "@/constants/colors";

import type {OwnershipItem} from "@/stores/server/ownership/typed";
import {formatAmount} from "@/utils/amountUtil";
import React from "react";
import type {StyleProp, TextStyle} from "react-native";
import {Text, View} from "react-native";
import {formatDate} from "@/utils/dateUtil";

type OwnershipSummaryLabels = {
    profitLoss: string;
    totalCost: string;
    totalIncome: string;
    licenseCity:string;
    licenseEndDate:string;
    totalLicenseValidityDays:string;
    purchaseDate:string;
    purchasePlace:string;
    sellDate:string;
    soldPlace:string;
    currencySuffix: string;
    daySuffix:string;
    notes: string;
};

type OwnershipSummaryCardProps = {
    item: OwnershipItem | null | undefined;
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

function formatDays(value: number | undefined, daySuffix: string): string {
    if (typeof value !== "number" || !Number.isFinite(value)) return "-";
    return `${value} ${daySuffix}`;
}

export function OwnershipSummaryCard({
                                         item,
                                         labels,
                                         style,
                                         mmLeading
                                     }: OwnershipSummaryCardProps) {

    const title = valueText(item?.equipmentName);
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
                {/* equipment name,  plate no. */}
                <View className="flex-1">
                    <Text
                        className={`text-base font-bold  ${mmLeading}`}
                        style={[style,{color:APP_COLORS.textPrimary}]}
                    >
                        {title}
                    </Text>
                    <View className="flex-row items-center gap-1">
                        <Text className={`text-sm font-medium ${mmLeading}`} style={[style,{color:APP_COLORS.primary}]}>
                             {plateNo}
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
            <View className="flex-row mt-2 pt-3 gap-x-3 border-t border-slate-200 ">
                <InfoCell
                    label={labels.totalCost}
                    value={formatLocalizedAmount(item?.totalCost, labels.currencySuffix)}
                    style={style}
                    mmLeading={mmLeading}
                />
                <InfoCell
                    label={labels.totalIncome}
                    value={formatLocalizedAmount(item?.totalIncome, labels.currencySuffix)}
                    style={style}
                    mmLeading={mmLeading}
                />
            </View>

            {/* purchase date , sell date */}
            <View className="flex-row mt-1 pt-1 gap-x-3 ">
                <InfoCell
                    label={labels.purchaseDate}
                    value={formatDate(item?.buyDate)}
                    style={style}
                    mmLeading={mmLeading}
                />
                <InfoCell
                    label={labels.sellDate}
                    value={formatDate(item?.sellDate)}
                    style={style}
                    mmLeading={mmLeading}
                />
            </View>

            {/* purchase place , sell place */}
            <View className="flex-row mt-1 pt-1 gap-x-3 ">
                <InfoCell
                    label={labels.purchasePlace}
                    value={valueText(item?.purchasePlace)}
                    style={style}
                    mmLeading={mmLeading}
                />
                <InfoCell
                    label={labels.soldPlace}
                    value={valueText(item?.soldPlace)}
                    style={style}
                    mmLeading={mmLeading}
                />
            </View>

            {/* license city , end date , validity days */}
            <View className="flex-row mt-1 pt-2 border-t border-slate-200 ">
                {/* license city */}
                <InfoCell
                    label={labels.licenseCity}
                    value={valueText(item?.licenseCity)}
                    style={style}
                    mmLeading={mmLeading}
                />
                {/* license end date */}
                <InfoCell
                    label={labels.licenseEndDate}
                    value={formatDate(item?.licenseEndDate)}
                    style={style}
                    mmLeading={mmLeading}
                />
                {/* license validity days */}
                <InfoCell
                    label={labels.totalLicenseValidityDays}
                    value={formatDays(item?.totalLicenseValidityDays, labels.daySuffix)}
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
                    className={` text-sm font-bold ${mmLeading}`}
                    style={[style,{color:APP_COLORS.textPrimary}]}
                >
                    {valueText(item?.notes)}
                </Text>
            </View>
        </View>
    );
}

type InfoCellProps = {
    label: string;
    value: string;
    style?: StyleProp<TextStyle>;
    mmLeading: any;
};

function InfoCell({label, value, style,mmLeading}: InfoCellProps) {
    return (
        <View className="flex-1">
            <Text
                className={`text-xs font-medium ${mmLeading}`}
                style={[style,{color:APP_COLORS.textMuted}]}
            >
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
