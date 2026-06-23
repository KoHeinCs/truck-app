import React, { useState } from 'react';
import { View, Text, Platform, Pressable, ScrollView } from 'react-native';
import { Input } from 'heroui-native';
import { APP_COLORS } from "@/constants/colors";
import {useTranslation} from "@/hooks/use-translation";

export interface PersonRecord { name: string; amount: number; }

interface Step2Props {
    headcount: number;
    initialTotalCost: number;
    initialPeople: PersonRecord[];
    locale: "en" | "mm";
    style?: any;
    onBack: () => void;
    onNext: (totalCost: number, list: PersonRecord[]) => void;
    mmLeading:any
}

export  function Step2({ headcount, initialTotalCost, initialPeople, locale, style, onBack, onNext , mmLeading}: Step2Props) {
    const [totalCost, setTotalCost] = useState<string>(initialTotalCost > 0 ? initialTotalCost.toString() : "");
    const [people, setPeople] = useState<PersonRecord[]>(() => {
        if (initialPeople.length === headcount) return initialPeople;
        return Array.from({ length: headcount }, (_, i) => ({ name: initialPeople[i]?.name || "", amount: initialPeople[i]?.amount || 0 }));
    });
    const [error, setError] = useState<string | null>(null);
    const {step2:t} = useTranslation('profit');

    const handleUpdatePerson = (index: number, field: keyof PersonRecord, val: string) => {
        const next = [...people];
        if (field === 'amount') {
            const sanitized = val.replace(/[^0-9.]/g, '');
            next[index].amount = Number(sanitized) || 0;
        } else {
            next[index].name = val;
        }
        setPeople(next);
        if (error) setError(null);
    };

    const handleEvenSplit = () => {
        const total = Number(totalCost) || 0;
        if (total <= 0) {
            setError(locale === "mm" ? "စုစုပေါင်းကုန်ကျစရိတ်ကို အရင်ထည့်ပေးပါ" : "Enter Total Cost Amount first");
            return;
        }
        const baseSplit = Math.floor((total / headcount) * 100) / 100;
        const next = people.map((p, i) => ({
            ...p,
            amount: i === headcount - 1 ? Number((total - baseSplit * (headcount - 1)).toFixed(2)) : baseSplit
        }));
        setPeople(next);
        setError(null);
    };

    const handleProceed = () => {
        setError(null);
        const total = Number(totalCost) || 0;
        if (total <= 0) {
            setError(locale === "mm" ? "စုစုပေါင်း ကုန်ကျစရိတ် မှားယွင်းနေသည်" : "Invalid total cost amount");
            return;
        }

        const incomplete = people.some(p => !p.name.trim() || p.amount <= 0);
        if (incomplete) {
            setError(locale === "mm" ? "အမည်နှင့် ကျသင့်ငွေများ အားလုံးဖြည့်စွက်ပါ" : "Please fill names and amounts for everyone");
            return;
        }

        const sum = people.reduce((acc, curr) => acc + curr.amount, 0);
        if (Math.abs(sum - total) > 0.01) {
            setError(locale === "mm" ? `ခွဲဝေငွေ စုစုပေါင်း (${sum}) သည် ကုန်ကျစရိတ် (${total}) နှင့် ကိုက်ညီမှုမရှိပါ` : `Total mismatch (Sum: ${sum} / Expected: ${total})`);
            return;
        }

        onNext(total, people);
    };

    return (
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View className="gap-4 pb-6">

                {/* Total Cost Input Row */}
                <View className="gap-1.5">
                    <Text className={`text-sm font-medium ${mmLeading}`} style={[{ color: APP_COLORS.textSecondary }, style]}>
                        {t.labels.totalCost}
                    </Text>
                    <Input
                        value={totalCost}
                        onChangeText={(val) => { setTotalCost(val.replace(/[^0-9.]/g, '')); if (error) setError(null); }}
                        placeholder={t.placeholders.totalCost}
                        placeholderTextColor={APP_COLORS.textMuted}
                        keyboardType="decimal-pad"
                        style={[{ backgroundColor: APP_COLORS.inputBackground, borderColor: APP_COLORS.border, borderWidth: 1, color: APP_COLORS.textPrimary }, style]}
                        className={`text-sm font-medium ${mmLeading}`}
                        {...(Platform.OS === "android" && locale === "mm" ? { includeFontPadding: false } : {})}
                    />
                </View>

                {/* Auto Split Action Box */}
                <Pressable
                    onPress={handleEvenSplit}
                    className="h-11 border border-dashed rounded-xl items-center justify-center"
                    style={({ pressed }) => ({ borderColor: APP_COLORS.primary, backgroundColor: pressed ? APP_COLORS.primarySoft : 'transparent' })}
                >
                    <Text className={`text-xs font-bold ${mmLeading}`} style={[style, { color: APP_COLORS.primary }]}>
                        {t.actions.autoEvenSplit}
                    </Text>
                </Pressable>

                <Text className={`text-xs font-bold uppercase tracking-wider mt-2 ${mmLeading}`} style={[{ color: APP_COLORS.textMuted }, style]}>
                    {t.labels.individualInfo}
                </Text>

                {/* Dynamic Items Mapping */}
                <View className="gap-3">
                    {people.map((person, index) => (
                        <View key={index} className="flex-row gap-2 w-full items-center">
                            <View className="flex-1">
                                <Input
                                    value={person.name}
                                    onChangeText={(val) => handleUpdatePerson(index, 'name', val)}
                                    placeholder={`${t.placeholders.name} #${index + 1}`}
                                    placeholderTextColor={APP_COLORS.textMuted}
                                    style={[{ backgroundColor: APP_COLORS.card, borderColor: APP_COLORS.border, borderWidth: 1, color: APP_COLORS.textPrimary }, style]}
                                    className={`text-sm font-medium ${mmLeading}`}
                                    {...(Platform.OS === "android" && locale === "mm" ? { includeFontPadding: false } : {})}
                                />
                            </View>
                            <View className="flex-[1.5]">
                                <Input
                                    value={person.amount > 0 ? person.amount.toString() : ""}
                                    onChangeText={(val) => handleUpdatePerson(index, 'amount', val)}
                                    placeholder={t.placeholders.amount}
                                    placeholderTextColor={APP_COLORS.textMuted}
                                    keyboardType="decimal-pad"
                                    style={[{ backgroundColor: APP_COLORS.card, borderColor: APP_COLORS.border, borderWidth: 1, color: APP_COLORS.textPrimary }, style]}
                                    className={`text-sm font-bold ${mmLeading}`}
                                    {...(Platform.OS === "android" && locale === "mm" ? { includeFontPadding: false } : {})}
                                />
                            </View>
                        </View>
                    ))}
                </View>

                {!!error && (
                    <Text className={`text-xs font-normal ${mmLeading}`} style={[{ color: APP_COLORS.error }, style]}>
                        {error}
                    </Text>
                )}

                {/* Navigation Action Buttons Panel */}
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
                        onPress={handleProceed}
                        className="flex-1 h-12 rounded-xl items-center justify-center"
                        style={({ pressed }) => ({ backgroundColor: pressed ? APP_COLORS.primaryPressed : APP_COLORS.primary })}
                    >
                        <Text className={`font-semibold text-white ${mmLeading}`} style={style}>
                            {t.actions.next}
                        </Text>
                    </Pressable>
                </View>

            </View>
        </ScrollView>
    );
}
