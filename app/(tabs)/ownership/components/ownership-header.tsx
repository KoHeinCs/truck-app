import React from "react";
import type {StyleProp, TextStyle} from "react-native";
import {Text, View} from "react-native";
import {APP_COLORS} from "@/constants/colors";

type OwnershipHeaderProps = {
    title: string;
    welcomeLabel: string;
    fullName: string;
    style?: StyleProp<TextStyle>;
    mmLeading: any;
};

export function OwnershipHeader({
                                    title,
                                    welcomeLabel,
                                    fullName,
                                    style,
                                    mmLeading
                                }: OwnershipHeaderProps) {
    return (
        <View className="mb-3 flex-row items-center justify-between">
            <View className="max-w-[72%]">
                <Text
                    className={`text-sm ${mmLeading}`}
                    style={[{color: APP_COLORS.textMuted}, style]}
                >
                    {welcomeLabel}
                </Text>
                <Text
                    className={`mt-1 text-lg font-normal ${mmLeading}`}
                    style={[style, {color: APP_COLORS.textPrimary}]}
                >
                    {fullName}
                </Text>
            </View>

            <Text
                className={`mt-0 text-lg font-bold ${mmLeading}`}
                style={[{color: APP_COLORS.textPrimary}, style]}
            >
                {title}
            </Text>
        </View>
    );
}
