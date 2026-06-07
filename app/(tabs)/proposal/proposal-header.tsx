import React from "react";
import {Text, View} from "react-native";
import {APP_COLORS} from "@/constants/colors";

type ProposalHeaderProps = {
    title: string;
    welcomeLabel: string;
    fullName: string;
    textStyle: any;
    mmLeading: any;
};

export function ProposalHeader({
                                   title,
                                   welcomeLabel,
                                   fullName,
                                   textStyle,
                                   mmLeading
                               }: ProposalHeaderProps) {


    return (
        <View className="mb-3 flex-row items-center justify-between">
            <View className="max-w-[72%]">
                <Text
                    className={`text-sm ${mmLeading}`}
                    style={[{color: APP_COLORS.textMuted}, textStyle]}
                >
                    {welcomeLabel}
                </Text>
                <Text
                    className={`mt-1 text-lg font-normal ${mmLeading}`}
                    style={[textStyle, {color: APP_COLORS.textPrimary}]}
                >
                    {fullName}
                </Text>
            </View>

            <Text
                className={`mt-0 text-lg font-bold ${mmLeading}`}
                style={[{color: APP_COLORS.textPrimary}, textStyle]}
            >
                {title}
            </Text>
        </View>
    );
}
