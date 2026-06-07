import {getMyanmarLeadingClass, myanmarUITextStyle} from "@/constants/myanmar-font";
import type {AppLocale} from "@/stores/client/locale-store";
import React, {useMemo} from "react";
import {Text, View} from "react-native";
import {APP_COLORS} from "@/constants/colors";

type ProposalHeaderProps = {
    title: string;
    welcomeLabel: string;
    fullName: string;
    locale: AppLocale;
};

export function ProposalHeader({
                                   title,
                                   welcomeLabel,
                                   fullName,
                                   locale,
                               }: ProposalHeaderProps) {


    const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
    const textStyle = locale === "mm" ? mmTextStyle : undefined;
    const mmLeadingClass = getMyanmarLeadingClass(locale);
    const mmBodyStyle = useMemo(
        () => [mmTextStyle, {fontWeight: "400" as const}],
        [mmTextStyle],
    );

    return (
        <View className="mb-3 flex-row items-center justify-between">
            <View className="max-w-[72%]">
                <Text
                    className={`text-sm ${mmLeadingClass}`}
                    style={[{color: APP_COLORS.textMuted}, textStyle]}
                >
                    {welcomeLabel}
                </Text>
                <Text
                    className={`mt-1 text-lg font-normal ${mmBodyStyle} ${mmLeadingClass}`}
                    style={[textStyle, {color: APP_COLORS.textPrimary}]}
                >
                    {fullName}
                </Text>
            </View>

            <Text
                className={`mt-0 text-lg font-bold ${mmLeadingClass}`}
                style={[{color: APP_COLORS.textPrimary}, textStyle]}
            >
                {title}
            </Text>
        </View>
    );
}
