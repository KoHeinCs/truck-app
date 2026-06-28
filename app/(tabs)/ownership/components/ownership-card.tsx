import {
    myanmarUITextStyle,
} from "@/constants/myanmar-font";
import type {AppLocale} from "@/stores/client/locale-store";
import type {OwnershipItem} from "@/stores/server/ownership/typed";
import {Card} from "heroui-native";
import React, {useMemo} from "react";
import {Pressable, Text, View} from "react-native";
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
    locale: AppLocale;
    labels: OwnershipCardLabels;
    onPress?: () => void;
    mmLeading: any;
    status: string;
};

function valueText(value: unknown): string {
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
}

function formatDate(value: string | null | undefined): string {
    if (!value) return "-";
    const raw = value.includes("T") ? value.split("T")[0] : value.split(" ")[0];
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
    if (!match) return value;
    const [, yyyy, mm, dd] = match;
    return `${dd}/${mm}/${yyyy}`;
}

function formatDays(value: number | undefined, daySuffix: string): string {
    if (typeof value !== "number" || !Number.isFinite(value)) return "-";
    return `${value} ${daySuffix}`;
}

export function OwnershipCard({item, locale, labels, onPress, mmLeading, status}: OwnershipCardProps) {
    const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
    const style = locale === "mm" ? mmTextStyle : undefined;

    const title = valueText(item.equipmentName);
    const plateNo = valueText(item.truckPlateNo);
    const ownershipDays = formatDays(item.totalOwnershipDays, labels.daySuffix);
    const estimatedSellAmt = valueText(item.estimatedSellAmt);

    return (
        <Pressable onPress={onPress} disabled={!onPress}>
            <Card className="mb-2 flex-1 w-full"
                  style={{
                      backgroundColor: APP_COLORS.card,
                      borderColor: APP_COLORS.border,
                      borderWidth: 1,
                      flex: 1
                  }}
            >
                <Card.Body className="px-2 py-2.5 justify-between flex-1">
                    {/* title , plate no , total owned days */}
                    <View className="flex-row justify-between gap-x-3 items-center">
                        <View className="flex-1 min-w-0">
                            <Text
                                className={`text-sm font-bold ${mmLeading}`}
                                style={[style, {color: APP_COLORS.textPrimary}]}
                                numberOfLines={1}
                            >
                                {title}
                            </Text>
                            <Text
                                className={`mt-0.5 text-xs font-semibold ${mmLeading}`}
                                style={{color: APP_COLORS.primary}}
                                numberOfLines={1}
                            >
                                {plateNo}
                            </Text>
                        </View>

                        <View className="items-end min-w-[80px]">
                            <Text
                                className={`text-xs font-bold  ${mmLeading}`}
                                style={[style, {color: APP_COLORS.textMuted}]}
                            >
                                {labels.ownership}
                            </Text>
                            <Text
                                className={`mt-0.5 text-sm font-bold ${mmLeading}`}
                                style={[style, {color: APP_COLORS.primary}]}>
                                {ownershipDays}
                            </Text>
                        </View>
                    </View>
                    {/* license city , license end date , license validity days */}
                    <View className="mt-2 pt-2"
                          style={{borderTopWidth: 0.5, borderTopColor: APP_COLORS.border}}
                    >
                        <View className="flex-row w-full justify-between">
                            <View className="flex-1">
                                <InfoCell
                                    label={labels.licenseCity}
                                    value={valueText(item.licenseCity)}
                                    style={style}
                                    mmLeading={mmLeading}
                                />
                            </View>
                            <View className="flex-1 px-1">
                                <InfoCell
                                    label={labels.licenseEndDate}
                                    value={formatDate(item.licenseEndDate)}
                                    style={style}
                                    mmLeading={mmLeading}
                                />
                            </View>

                            <View className="flex-1 items-end">
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
                    </View>
                    {/* buy date , sell date , estimated sell amount */}
                    <View
                        className="mt-3 pt-3"
                        style={{borderTopWidth: 1, borderTopColor: APP_COLORS.border}}
                    >
                        <View className="flex-row w-full justify-between">
                            <InfoCell
                                label={labels.buyDate}
                                value={formatDate(item.buyDate)}
                                style={style}
                                mmLeading={mmLeading}
                            />
                            {status === 'SOLD_OUT' && (
                                <InfoCell
                                    label={labels.buyDate}
                                    value={formatDate(item.sellDate)}
                                    style={style}
                                    mmLeading={mmLeading}
                                />
                            )
                            }
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
    valueClassName?: string;
    style?: ReturnType<typeof myanmarUITextStyle>;
    mmLeading: any
};

function InfoCell({
                      label,
                      value,
                      className = "flex-1",
                      valueClassName = "text-slate-900",
                      style,
                      mmLeading
                  }: InfoCellProps) {
    return (
        <View className={className}>
            <Text
                className={`text-xs font-bold ${mmLeading}`}
                style={[style, {color: APP_COLORS.textMuted}]}
            >
                {label}
            </Text>
            <Text
                className={`mt-0.5 text-xs font-semibold ${mmLeading} ${valueClassName}`}
                style={[style]}
            >
                {value}
            </Text>
        </View>
    );
}
