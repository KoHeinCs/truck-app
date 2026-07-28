import React, { useState } from 'react';
import { View, Text, Platform, Pressable, ScrollView } from 'react-native';
import { Input } from 'heroui-native';
import { APP_COLORS } from "@/constants/colors";
import { getMyanmarLeadingClass } from "@/constants/myanmar-font";
import { PersonRecord } from './Step2';
import {useTranslation} from "@/hooks/use-translation";

interface Step3Props {
    totalCostAmount: number;
    peopleList: PersonRecord[];
    locale: "en" | "mm";
    style?: any;
    onBack: () => void;
    onSubmit: (finalPayload: any) => void;
    formatAmount: (val: number) => string;
    mmLeading:any
}

interface DistributionResult extends PersonRecord {
    sharePercentage: number;
    profitShare: number;
}

export  function Step3({ totalCostAmount, peopleList, locale, style, onBack, onSubmit, formatAmount,mmLeading }: Step3Props) {
    const [profitInput, setProfitInput] = useState<string>("");
    const [results, setResults] = useState<DistributionResult[]>([]);
    const [error, setError] = useState<string | null>(null);
    const {step3:t} = useTranslation('profit')

    const handleCalculate = () => {
        setError(null);
        const totalProfit = Number(profitInput.trim()) || 0;
        if (totalProfit <= 0) {
            setError(locale === "mm" ? "စုစုပေါင်းအမြတ်ငွေ မှားယွင်းနေသည်" : "Invalid total profit amount");
            return;
        }

        const distributions = peopleList.map(p => {
            const sharePct = totalCostAmount > 0 ? (p.amount / totalCostAmount) * 100 : 0;
            const profitShare = (sharePct / 100) * totalProfit;
            return {
                ...p,
                sharePercentage: Number(sharePct.toFixed(1)),
                profitShare: Number(profitShare.toFixed(2))
            };
        });
        setResults(distributions);
    };

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View className="gap-4 pb-6">

                {/* Profit Input Field */}
                <View className="gap-1.5">
                    <Text className={`text-sm font-medium ${mmLeading}`} style={[{ color: APP_COLORS.textSecondary }, style]}>
                        {t.labels.totalProfit}
                    </Text>
                    <Input
                        value={profitInput}
                        onChangeText={(val) => { setProfitInput(val.replace(/[^0-9.]/g, '')); if (error) setError(null); }}
                        placeholder={t.placeholders.totalProfit}
                        placeholderTextColor={APP_COLORS.textMuted}
                        keyboardType="decimal-pad"
                        style={[{ backgroundColor: APP_COLORS.inputBackground, borderColor: APP_COLORS.border, borderWidth: 1, color: APP_COLORS.textPrimary }, style]}
                        className={`text-sm font-medium ${mmLeading}`}
                        {...(Platform.OS === "android" && locale === "mm" ? { includeFontPadding: false } : {})}
                    />
                    {!!error && (
                        <Text className={`text-xs font-normal ${mmLeading}`} style={[{ color: APP_COLORS.error }, style]}>
                            {error}
                        </Text>
                    )}
                </View>

                <Pressable
                    onPress={handleCalculate}
                    className="w-full h-11 border border-dashed rounded-xl items-center justify-center"
                    style={({ pressed }) => ({ borderColor: APP_COLORS.primary, backgroundColor: pressed ? APP_COLORS.primarySoft : 'transparent' })}
                >
                    <Text className={`text-xs font-bold ${mmLeading}`} style={[style, { color: APP_COLORS.primary }]}>
                        {t.actions.calculate}
                    </Text>
                </Pressable>

                {/* Output Previews */}
                {results.length > 0 && (
                    <View className="gap-2 mt-1">
                        <Text className={`text-xs font-bold uppercase tracking-wider ${mmLeading}`} style={[{ color: APP_COLORS.textMuted }, style]}>
                            {t.labels.profitInfo}
                        </Text>

                        <View className="rounded-2xl p-4 border gap-y-3" style={{ backgroundColor: APP_COLORS.card, borderColor: APP_COLORS.border, borderWidth: 1 }}>
                            {results.map((item, idx) => (
                                <View key={idx} className="gap-y-2">
                                    <View className="flex-row items-center justify-between gap-x-4">
                                        <View className="flex-1 min-w-0">
                                            <Text className={`text-sm font-bold ${mmLeading}`} style={[style, { color: APP_COLORS.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                                            <Text className={`text-xs font-medium mt-0.5 ${mmLeading} `} style={[style, { color: APP_COLORS.textMuted }]}>{t.labels.percentage}: {item.sharePercentage}%</Text>
                                        </View>
                                        <View className="items-end">
                                            <Text className={`text-xs font-medium ${mmLeading}`} style={[style, { color: APP_COLORS.textSecondary }]}>{t.labels.amount}: {formatAmount(item.amount)}</Text>
                                            <Text className={`text-sm font-extrabold mt-0.5 ${mmLeading}`} style={[style, { color: APP_COLORS.primary }]}>+ {formatAmount(item.profitShare)}</Text>
                                        </View>
                                    </View>
                                    {idx < results.length - 1 && <View className="h-px bg-slate-100" style={{ backgroundColor: APP_COLORS.border, opacity: 0.5 }} />}
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Actions Footer */}
                <View className="flex-row gap-2 pt-2">
                    <Pressable
                        onPress={onBack}
                        className="flex-1 h-12 border rounded-xl items-center justify-center"
                        style={({ pressed }) => ({ borderColor: APP_COLORS.border, backgroundColor: pressed ? APP_COLORS.inputBackground : 'transparent' })}
                    >
                        <Text className={`font-semibold ${mmLeading}`} style={[{ color: APP_COLORS.textSecondary }, style]}>
                            {t.actions.back}
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => results.length > 0 && onSubmit({ totalProfit: Number(profitInput), distributions: results })}
                        disabled={results.length === 0}
                        className="flex-1 h-12 rounded-xl items-center justify-center"
                        style={({ pressed }) => ({
                            backgroundColor: results.length === 0 ? APP_COLORS.border : (pressed ? APP_COLORS.primaryPressed : APP_COLORS.primary),
                            opacity: results.length === 0 ? 0.6 : 1
                        })}
                    >
                        <Text className={`font-semibold text-white ${mmLeading}`} style={style}>
                            {t.actions.done}
                        </Text>
                    </Pressable>
                </View>

            </View>
        </ScrollView>
    );
}
