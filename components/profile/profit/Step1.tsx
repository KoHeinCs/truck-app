import React, { useState } from 'react';
import { View, Text, Platform, Pressable } from 'react-native';
import { Input } from 'heroui-native';
import { APP_COLORS } from "@/constants/colors";
import {useTranslation} from "@/hooks/use-translation";

interface Step1Props {
    initialCount: number;
    locale: "en" | "mm";
    style?: any;
    onNext: (count: number) => void;
    mmLeading : any
}

export  function Step1({ initialCount, locale, style, onNext,mmLeading }: Step1Props) {

    const [headcount, setHeadcount] = useState<string>(initialCount > 0 ? initialCount.toString() : "");
    const [error, setError] = useState<string | null>(null);
    const {step1:t} = useTranslation('profit')

    const handleProceed = () => {
        setError(null);
        const count = parseInt(headcount.trim(), 10);

        if (isNaN(count) || count <= 0) {
            setError(locale === "mm" ? "အနည်းဆုံး ၁ ယောက် ရှိရမည်" : "Must be at least 1 person");
            return;
        }
        if (count > 20) {
            setError(locale === "mm" ? "အများဆုံး ၂၀ ယောက်အထိသာ ခွင့်ပြုပါသည်" : "Maximum limit is 20 people");
            return;
        }
        onNext(count);
    };

    return (
        <View className="gap-4">
            <View className="gap-1.5">
                <View className="flex-row items-center gap-1">
                    <Text
                        className={`text-sm font-medium ${mmLeading}`}
                        style={[{ color: APP_COLORS.textSecondary }, style]}
                    >
                        {t.labels.totalPerson}
                    </Text>
                </View>

                <Input
                    value={headcount}
                    onChangeText={(val) => {
                        setHeadcount(val.replace(/[^0-9]/g, ''));
                        if (error) setError(null);
                    }}
                    maxLength={2}
                    placeholder={t.placeholders.totalPerson}
                    placeholderTextColor={APP_COLORS.textMuted}
                    keyboardType="number-pad"
                    style={[{
                        backgroundColor: APP_COLORS.inputBackground,
                        borderColor: error ? APP_COLORS.error : APP_COLORS.border,
                        borderWidth: 1,
                        color: APP_COLORS.textPrimary
                    }, style]}
                    className={`text-sm font-medium ${mmLeading}`}
                    {...(Platform.OS === "android" && locale === "mm" ? { includeFontPadding: false } : {})}
                />

                {!!error && (
                    <Text
                        className={`text-xs font-normal ${mmLeading}`}
                        style={[{ color: APP_COLORS.error }, style]}
                    >
                        {error}
                    </Text>
                )}
            </View>

            <Pressable
                onPress={handleProceed}
                className="w-full h-12 items-center justify-center rounded-xl"
                style={({ pressed }) => ({
                    backgroundColor: pressed ? APP_COLORS.primaryPressed : APP_COLORS.primary
                })}
            >
                <Text className={`font-semibold text-white ${mmLeading}`} style={style}>
                    {t.actions.next}
                </Text>
            </Pressable>
        </View>
    );
}
