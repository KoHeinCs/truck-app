import React, {useMemo, useState} from 'react';
import {View, Text, Pressable, ScrollView} from 'react-native';
import {APP_COLORS} from '@/constants/colors';
import {SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import {useRouter} from "expo-router";
import {useLocaleStore} from "@/stores/client/locale-store";
import {getMyanmarLeadingClass, myanmarUITextStyle} from "@/constants/myanmar-font";
import {useTranslation} from "@/hooks/use-translation";
import {Step1} from "./components/Step1";
import {Step2,PersonRecord} from './components/Step2'
import {Step3} from "./components/Step3"
import {formatAmount} from '@/utils/amountUtil'

export type AppLocale = "en" | "mm";


export default function Profit() {

    const router = useRouter();
    const locale = useLocaleStore((state) => state.locale);
    const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
    const style = locale === "mm" ? mmTextStyle : undefined;
    const t = useTranslation('profit')
    const mmLeading = getMyanmarLeadingClass(locale);
    const insets = useSafeAreaInsets();


    const [currentStep, setCurrentStep] = useState<number>(1);
    const [headcount, setHeadcount] = useState<number>(0);

    const [totalCost, setTotalCost] = useState<number>(0);
    const [peopleList, setPeopleList] = useState<PersonRecord[]>([]);

    const handleFinalSubmit = (finalPayload: any) => {
        router.back()
    };


    return (
        <SafeAreaView className="flex-1" style={{backgroundColor: APP_COLORS.background}}>

            {/* title , back button */}
            <View className="flex-row items-center px-4 pt-1">
                <Pressable
                    onPress={() => router.back()}
                    className="h-11 w-11 items-center justify-center rounded-full "
                    style={({pressed}) => ({
                        backgroundColor: pressed ? APP_COLORS.primary : APP_COLORS.background
                    })}
                >
                    <Ionicons name="arrow-back" size={22} color={APP_COLORS.textPrimary}/>
                </Pressable>

                <Text
                    className="flex-1 px-3 text-center text-lg font-bold "
                    style={[style, {color: APP_COLORS.textPrimary}]}
                >
                    {t.master.title}
                </Text>

                <View className="h-11 w-11"/>
            </View>

            <ScrollView
                className="px-4"
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 80,
                    flexGrow: 1,
                }}
            >
                <View className="mt-4 rounded-2xl p-4"
                      style={{
                          backgroundColor: APP_COLORS.card,
                          borderColor: APP_COLORS.border,
                          borderWidth: 1
                      }}
                >

                    <View className="gap-3">

                        {/* step 1 */}
                        {currentStep === 1 && (
                            <Step1
                                initialCount={headcount}
                                locale={locale}
                                style={style}
                                onNext={(count) => {
                                    setHeadcount(count);
                                    setCurrentStep(2);
                                }}
                                mmLeading={mmLeading}
                            />
                        )}

                        {currentStep === 2 && (
                            <Step2
                                headcount={headcount}
                                initialTotalCost={totalCost}
                                initialPeople={peopleList}
                                locale={locale}
                                style={style}
                                onBack={() => setCurrentStep(1)}
                                onNext={(cost, list) => { setTotalCost(cost); setPeopleList(list); setCurrentStep(3); }}
                                mmLeading={mmLeading}
                            />
                        )}

                        {currentStep === 3 && (
                            <Step3
                                totalCostAmount={totalCost}
                                peopleList={peopleList}
                                locale={locale}
                                style={style}
                                formatAmount={formatAmount}
                                onBack={() => setCurrentStep(2)}
                                onSubmit={handleFinalSubmit}
                                mmLeading={mmLeading}
                            />
                        )}

                    </View>


                </View>

            </ScrollView>


        </SafeAreaView>
    );
};

