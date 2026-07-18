import { ServiceDatePicker } from "@/components/service-date-picker";
import { APP_COLORS } from "@/constants/colors";
import {
    getMyanmarLeadingClass,
    myanmarUITextStyle,
} from "@/constants/myanmar-font";
import { useTranslation } from "@/hooks/use-translation";
import { getApiErrorAlertCopy } from "@/lib/api-error-alert";
import { useLocaleStore } from "@/stores/client/locale-store";
import { useSellOwnership } from "@/stores/server/ownership/sell-mutation";
import { toIsoDate, todayIsoLocal } from "@/utils/dateUtil";
import Ionicons from "@expo/vector-icons/Ionicons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Input } from "heroui-native";
import { useCallback, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import { z } from "zod";

const DATE_MSG = {
    en: "Use dd/mm/yyyy",
    mm: "နေ့/လ/နှစ် ပုံစံ dd/mm/yyyy ထည့်ပါ",
} as const;

function buildSchema(locale: "en" | "mm") {
    return z.object({
        sellAmount: z
            .string()
            .min(
                1,
                locale === "mm" ? "အဆိုပြုငွေ လိုအပ်သည်" : "Proposed amount is required",
            )
            .refine((value) => /^\d{1,9}(\.\d{1,2})?$/.test(value.trim()), {
                message:
                    locale === "mm"
                        ? "ပမာဏမှားယွင်းနေသည် (အများဆုံး ၉ လုံး)"
                        : "Invalid format (max 9 digits)",
            })
            .refine((value) => parseFloat(value) > 0, {
                message:
                    locale === "mm"
                        ? "ပမာဏသည် သုညထက် ကြီးရမည်"
                        : "Amount must be greater than zero",
            }),
        sellDate: z
            .string()
            .min(1, locale === "mm" ? "ရောင်းရက် လိုအပ်သည်" : "Sale date is required")
            .refine((value) => !!toIsoDate(value), { message: DATE_MSG[locale] })
            .refine((value) => {
                const iso = toIsoDate(value);
                if (!iso) return false;
                return iso <= todayIsoLocal();
            }, {
                message:
                    locale === "mm"
                        ? "ရောင်းရက်သည် အနာဂတ်မဖြစ်ရပါ"
                        : "Sold date cannot be in the future",
            }),
        soldPlace: z
            .string()
            .min(
                1,
                locale === "mm" ? "ရောင်းချသည့်နေရာ လိုအပ်သည်" : "Sell place is required",
            )
            .max(
                200,
                locale === "mm"
                    ? "ရောင်းချသည့်နေရာသည် စာလုံး 200 ထက်မကျော်ရပါ"
                    : "Sell place cannot exceed 200 characters",
            ),
    });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

type TextFieldKey = "sellAmount" | "soldPlace";

export default function OwnershipSellScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const locale = useLocaleStore((state) => state.locale);
    const { sellOwnership: t } = useTranslation("ownership");
    const errorCatalog = useTranslation("error");
    const { mutate, isPending } = useSellOwnership();
    const params = useLocalSearchParams<{ownershipId?: string}>();

    const ownershipId = String(params.ownershipId ?? "").trim();

    const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
    const style = locale === "mm" ? mmTextStyle : undefined;
    const mmLeading = getMyanmarLeadingClass(locale);

    const schema = useMemo(() => buildSchema(locale), [locale]);

    const {
        control,
        handleSubmit,
        formState: {errors},
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            sellAmount: "",
            sellDate: "",
            soldPlace: "",
        },
    });

    const onBack = useCallback(() => {
        router.back();
    }, [router]);

    const onSubmit = (values: FormValues) => {
        if (!ownershipId) {
            Alert.alert(t.dialog.errorTitle, t.dialog.errorBody);
            return;
        }

        const sellDateIso = toIsoDate(values.sellDate);
        if (!sellDateIso) {
            Alert.alert(t.dialog.errorTitle, t.dialog.errorBody);
            return;
        }

        mutate(
            {
                ownershipId,
                proposalAmount: Number(values.sellAmount),
                sellDate: sellDateIso,
                soldPlace: values.soldPlace.trim(),
            },
            {
                onSuccess: () => {
                    Alert.alert(t.dialog.successTitle, t.dialog.successBody, [
                        { text: "OK", onPress: () => router.back() },
                    ]);
                },
                onError: (err: unknown) => {
                    const { title, message } = getApiErrorAlertCopy(err, errorCatalog, {
                        title: t.dialog.errorTitle,
                        message: t.dialog.errorBody,
                    });
                    Alert.alert(title, message);
                },
            },
        );
    };

    const renderTextInput = (
        key: TextFieldKey,
        options?: {
            keyboardType?: "decimal-pad";
            sanitize?: (text: string) => string;
        },
    ) => (
        <View className="gap-1.5">
            <View className="flex-row items-center gap-1">
                <Text
                    className={`text-sm font-medium ${mmLeading}`}
                    style={[{color: APP_COLORS.textSecondary}, style]}
                >
                    {t.labels[key]}
                </Text>
            </View>
            <Controller
                control={control}
                name={key}
                render={({field: {value, onChange}}) => (
                    <Input
                        value={String(value ?? "")}
                        onChangeText={(text) =>
                            onChange(options?.sanitize ? options.sanitize(text) : text)
                        }
                        keyboardType={options?.keyboardType}
                        placeholder={t.placeholders[key]}
                        placeholderTextColor={APP_COLORS.textMuted}
                        style={[
                            {
                                backgroundColor: APP_COLORS.inputBackground,
                                borderColor: errors[key] ? APP_COLORS.error : APP_COLORS.border,
                                borderWidth: 1,
                                color: APP_COLORS.textPrimary,
                            },
                            style,
                        ]}
                        className={` h-12 py-0  font-medium ${mmLeading}  `}
                    />
                )}
            />
            {!!errors[key]?.message && (
                <Text
                    className={`text-xs font-normal ${mmLeading}`}
                    style={[{color: APP_COLORS.error}, style]}
                >
                    {String(errors[key]?.message)}
                </Text>
            )}
        </View>
    );

    const renderDateInput = () => (
        <View className="gap-1.5">
            <View className="flex-row items-center gap-1">
                <Text
                    className={`text-sm font-medium ${mmLeading}`}
                    style={[{color: APP_COLORS.textSecondary}, style]}
                >
                    {t.labels.sellDate}
                </Text>
            </View>
            <Controller
                control={control}
                name="sellDate"
                render={({field: {value, onChange}}) => (
                    <ServiceDatePicker
                        locale={locale}
                        value={String(value ?? "")}
                        onChange={onChange}
                        placeholder={t.placeholders.sellDate}
                        doneLabel={locale === "mm" ? "ရွေးချယ်မည်" : "Done"}
                        mode="date"
                        maximumDate={new Date()}
                        style={style}
                        triggerClassName={`h-12 px-3 ${mmLeading}`}
                    />
                )}
            />
            {!!errors.sellDate?.message && (
                <Text
                    className={`text-xs font-normal ${mmLeading}`}
                    style={[{color: APP_COLORS.error}, style]}
                >
                    {String(errors.sellDate.message)}
                </Text>
            )}
        </View>
    );

    return (
        <SafeAreaView
            className="flex-1"
            style={{backgroundColor: APP_COLORS.background, flex: 1}}
            edges={["top", "left", "right"]}
        >
            <View className="flex-row items-center px-4 pb-3 pt-1">
                <Pressable
                    onPress={onBack}
                    className="h-11 w-11 items-center justify-center rounded-full"
                    style={({pressed}) => ({
                        backgroundColor: pressed ? APP_COLORS.primary : APP_COLORS.background,
                    })}
                >
                    <Ionicons name="arrow-back" size={22} color="#475569"/>
                </Pressable>
                <Text
                    className={`flex-1 px-3 text-center text-lg font-bold ${mmLeading}`}
                    style={[style, {color: APP_COLORS.textPrimary}]}
                >
                    {t.title}
                </Text>
                <View className="h-11 w-11"/>
            </View>

            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    className="px-4"
                    contentContainerStyle={{
                        paddingBottom: insets.bottom + 80,
                        flexGrow: 1,
                    }}
                    keyboardShouldPersistTaps="handled"
                    automaticallyAdjustKeyboardInsets
                    keyboardDismissMode="on-drag"
                >
                    <View
                        className="mt-1 rounded-2xl p-4"
                        style={{
                            backgroundColor: APP_COLORS.card,
                            borderColor: APP_COLORS.border,
                            borderWidth: 1,
                        }}
                    >
                        <View className="gap-4">
                            {renderTextInput("sellAmount", {
                                keyboardType: "decimal-pad",
                                sanitize: (text) => text.replace(/[^\d.]/g, ""),
                            })}
                            {renderDateInput()}
                            {renderTextInput("soldPlace")}
                        </View>
                    </View>

                    <View className="mt-5 flex-row gap-3">
                        <Pressable
                            onPress={onBack}
                            disabled={isPending}
                            className="h-14 flex-1 items-center justify-center rounded-xl"
                            style={({pressed}) => ({
                                backgroundColor: pressed
                                    ? APP_COLORS.primarySoft
                                    : APP_COLORS.card,
                                borderColor: APP_COLORS.border,
                                borderWidth: 1,
                            })}
                        >
                            <Text
                                className={`text-sm font-semibold ${mmLeading}`}
                                style={[style, {color: APP_COLORS.textPrimary}]}
                            >
                                {t.actions.cancel}
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={handleSubmit(onSubmit)}
                            disabled={isPending || !ownershipId}
                            className="h-14 flex-[1.15] items-center justify-center rounded-xl"
                            style={({ pressed }) => ({
                                backgroundColor: pressed
                                    ? APP_COLORS.primaryPressed
                                    : APP_COLORS.primary,
                                opacity: isPending || !ownershipId ? 0.7 : 1,
                            })}
                        >
                            <Text
                                className={`text-sm font-semibold text-white ${mmLeading}`}
                                style={style}
                            >
                                {isPending ? t.actions.submitting : t.actions.submit}
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
