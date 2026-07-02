import {
    myanmarUITextStyle,
} from "@/constants/myanmar-font";
import type {OwnershipItem} from "@/stores/server/ownership/typed";
import {Card} from "heroui-native";
import React from "react";
import {Pressable, Text, View} from "react-native";
import {formatDate} from '@/utils/dateUtil'
import {APP_COLORS} from "@/constants/colors";

type OwnershipCardLabels = {
    ownership: string;
    buyDate: string;
    licenseEndDate: string;
    totalLicenseValidityDays: string;
    licenseCity: string;
    estimatedSellAmt: string;
    daySuffix: string;
};

type OwnershipCardProps = {
    item: OwnershipItem;
    labels: OwnershipCardLabels;
    onPress?: () => void;
    style?: ReturnType<typeof myanmarUITextStyle>;
    mmLeading: any;
};

function valueText(value: unknown): string {
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
}


function formatDays(value: number | undefined, daySuffix: string): string {
    if (typeof value !== "number" || !Number.isFinite(value)) return "-";
    return `${value} ${daySuffix}`;
}

export function OwnershipCard({item, labels, onPress, style, mmLeading}: OwnershipCardProps) {

    const equipmentName = valueText(item.equipmentName);
    const plateNo = valueText(item.truckPlateNo);
    const ownershipDays = formatDays(item.totalOwnershipDays, labels.daySuffix);
    const estimatedSellAmt = valueText(item.estimatedSellAmt);

    return (
        <Pressable onPress={onPress} disabled={!onPress}>
            <Card className="mb-3"
                  style={{
                      backgroundColor:APP_COLORS.card,
                      borderColor:APP_COLORS.border,
                      borderWidth:1
                  }}
            >
                <Card.Body className="px-4 py-4">
                    <View className="flex-row justify-between gap-3">
                        {/* equipment name , plate no. */}
                        <View className="flex-1">
                            <Text
                                className={`text-base font-bold  ${mmLeading}`}
                                style={[style,{color:APP_COLORS.textPrimary}]}
                            >
                                {equipmentName}
                            </Text>
                            <Text
                                className={`text-sm font-semibold ${mmLeading}`}
                                style={[style,{color:APP_COLORS.primary}]}
                            >
                                {plateNo}
                            </Text>
                        </View>

                        {/* ownership days */}
                        <View className="items-end">
                            <Text
                                className={`text-xs font-semibold ${mmLeading}`}
                                style={[style,{color:APP_COLORS.textMuted}]}
                            >
                                {labels.ownership}
                            </Text>
                            <Text
                                className={`text-sm font-bold ${mmLeading}`}
                                style={[style,{color:APP_COLORS.textPrimary}]}
                            >
                                {ownershipDays}
                            </Text>
                        </View>
                    </View>

                    <View className="mt-4 border-t border-slate-100 pt-3">
                        <View className="flex-row">
                            <InfoCell
                                label={labels.buyDate}
                                value={formatDate(item.buyDate)}
                                style={style}
                                mmLeading={mmLeading}
                            />
                            <InfoCell
                                label={labels.licenseEndDate}
                                value={formatDate(item.licenseEndDate)}
                                style={style}
                                mmLeading={mmLeading}
                            />
                            <InfoCell
                                label={labels.totalLicenseValidityDays}
                                value={formatDays(
                                    item.totalLicenseValidityDays,
                                    labels.daySuffix,
                                )}
                                style={style}
                                mmLeading={mmLeading}
                            />
                        </View>
                    </View>

                    <View className="mt-3 border-t border-slate-100 pt-3">
                        <View className="flex-row">
                            <InfoCell
                                label={labels.licenseCity}
                                value={valueText(item.licenseCity)}
                                style={style}
                                mmLeading={mmLeading}
                            />
                            <InfoCell
                                label={labels.estimatedSellAmt}
                                value={estimatedSellAmt}
                                className="flex-[2]"
                                style={style}
                                mmLeading={mmLeading}
                            />
                        </View>
                    </View>
                </Card.Body>
            </Card>
        </Pressable>
    );
}

type InfoCellProps = {
    label: string;
    value: string;
    className?: string;
    style?: ReturnType<typeof myanmarUITextStyle>;
    mmLeading: any;
};

function InfoCell({
                      label,
                      value,
                      className = "flex-1",
                      style,
                      mmLeading
                  }: InfoCellProps) {
    return (
        <View className={className}>
            <Text className={`text-[11px] font-medium ${mmLeading}`} style={[style,{color:APP_COLORS.textMuted}]}>
                {label}
            </Text>
            <Text
                className={`text-xs font-semibold ${mmLeading}`}
                style={[style,{color:APP_COLORS.textPrimary}]}
            >
                {value}
            </Text>
        </View>
    );
}
