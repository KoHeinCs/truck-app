import {APP_COLORS} from "@/constants/colors";
import type {OwnershipTruckStatus} from "@/stores/server/ownership/search-columns";
import React from "react";
import type {StyleProp, TextStyle} from "react-native";
import {Pressable, Text, View} from "react-native";
import {useTranslation} from "@/hooks/use-translation";

type OwnershipTabsProps = {
    value: OwnershipTruckStatus;
    onChange: (next: OwnershipTruckStatus) => void;
    style?: StyleProp<TextStyle>;
    mmLeading: any;
    tabs: OwnershipTruckStatus[];
};


export function OwnershipTabs({
                                  value,
                                  onChange,
                                  style,
                                  mmLeading,
                                  tabs
                              }: OwnershipTabsProps) {

    const {tabs: t} = useTranslation('ownership')

    return (
        <View
            className="mb-3 flex-row rounded-2xl  p-2"
            style={{
                backgroundColor: APP_COLORS.card,
                borderColor: APP_COLORS.border,
                borderWidth: 1
            }}
        >
            {tabs.map((tab) => {
                const active = tab === value;
                return (
                    <Pressable
                        key={tab}
                        onPress={() => onChange(tab)}
                        className="flex-1 items-center justify-center rounded-xl px-1 py-2.5"
                        style={active ? {backgroundColor: APP_COLORS.primary} : undefined}
                    >
                        <Text
                            className={`text-sm font-semibold ${mmLeading} ${active ? "text-white" : "text-slate-500"}`}
                            numberOfLines={1}
                            ellipsizeMode={"clip"}
                            style={style}
                        >
                            {t[tab]}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}
