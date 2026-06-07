import {APP_COLORS} from "@/constants/colors";
import type {AppLocale} from "@/stores/client/locale-store";
import type {ProposalTabStatus} from "@/stores/server/proposal/search-columns";
import React from "react";
import {Pressable, Text, View} from "react-native";
import {useTranslation} from "@/hooks/use-translation";

type ProposalTabsProps = {
    value: ProposalTabStatus;
    onChange: (next: ProposalTabStatus) => void;
    tabs: ProposalTabStatus[];
    style:any;
    mmLeading:any
};

export function ProposalTabs({
                                 value,
                                 onChange,
                                 tabs,
                                 style,
                                 mmLeading
                             }: ProposalTabsProps) {


    const {tabs: t} = useTranslation('proposal')

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
                        className={`flex-1 items-center justify-center rounded-xl px-1 py-2.5`}
                        style={active ? {backgroundColor: APP_COLORS.primary} : undefined}
                    >
                        <Text
                            className={`text-sm font-semibold ${mmLeading} ${active ? "text-white" : "text-slate-500"}`}
                            numberOfLines={1}
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
