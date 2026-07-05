import {APP_COLORS} from "@/constants/colors";
import {ServiceDatePicker} from "@/components/service-date-picker";
import {
    getMyanmarLeadingClass,
    myanmarUITextStyle,
} from "@/constants/myanmar-font";
import {useTranslation} from "@/hooks/use-translation";
import {getApiErrorAlertCopy} from "@/lib/api-error-alert";
import {useAuthStore} from "@/stores/auth-store";
import {useLocaleStore} from "@/stores/client/locale-store";
import {useOwnerLookupOptions} from "@/stores/server/ownership/owner-lookup-query";
import {usePurchaseOwnership} from "@/stores/server/ownership/purchase-mutation";
import {useTruckByPlateNo} from "@/stores/server/truck/query";
import {toIsoDate} from "@/utils/dateUtil";
import Ionicons from "@expo/vector-icons/Ionicons";
import {zodResolver} from "@hookform/resolvers/zod";
import {type Href, useLocalSearchParams, useRouter} from "expo-router";
import {Button, Input, Select} from "heroui-native";
import React, {useCallback, useEffect, useMemo} from "react";
import {Controller, useForm} from "react-hook-form";
import {Alert, Pressable, ScrollView, Text, View} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import {z} from "zod";

const YEAR_RE = /^\d{4}$/;
const DATE_MSG = {
    en: "Use dd/mm/yyyy",
    mm: "နေ့/လ/နှစ် ပုံစံ dd/mm/yyyy ထည့်ပါ",
} as const;
const FUEL_TYPES = [
    "DIESEL",
    "DIESEL_PREMIUM",
    "OCTANE_92",
    "OCTANE_95",
    "OCTANE_97",
    "CNG",
    "OTHER",
] as const;

function buildSchema(locale: "en" | "mm", showOwnerId: boolean) {
    return z.object({
        ownerId: showOwnerId
            ? z
                .string()
                .min(
                    1,
                    locale === "mm" ? "ယာဉ်ပိုင်ရှင်ကို ရွေးချယ်ပေးပါ" : "Please select an owner",
                )
            : z.string().optional().or(z.literal("")),
        plateNo: z
            .string()
            .min(1, locale === "mm" ? "ယာဉ်နံပါတ် လိုအပ်သည်" : "Plate number is required")
            .max(50, locale === "mm" ? "ယာဉ်နံပါတ်သည် စာလုံး 50 ထက်မကျော်ရပါ" : "Plate number cannot exceed 50 characters")
            .regex(
                /^[0-9A-Z]{2}-[0-9]{4}$/,
                locale === "mm"
                    ? "ယာဉ်နံပါတ် ဖော်မတ်မမှန်ပါ။ (ဥပမာ - 3R-9999)"
                    : "Invalid plate number format. (e.g., 3R-9999)"
            ),
        model: z
            .string()
            .min(1, locale === "mm" ? "တံဆိပ်အမျိုးအစား လိုအပ်သည်" : "Brand is required")
            .max(100, locale === "mm" ? "တံဆိပ်အမျိုးအစားသည် စာလုံး 100 ထက်မကျော်ရပါ" : "Brand cannot exceed 100 characters"),
        modelYear: z
            .string()
            .min(1, locale === "mm" ? "မော်ဒယ်ခုနှစ် လိုအပ်သည်" : "Model year is required")
            .refine((v) => YEAR_RE.test(v.trim()), {
                message: locale === "mm" ? "4 လုံးပါ နှစ်ကိုထည့်ပါ" : "Enter a valid 4-digit year"
            }),
        feet: z
            .string()
            .min(1, locale === "mm" ? "ပေအရှည်သည် လိုအပ်သည်" : "Feet length is required")
            .max(100, locale === "mm" ? "အများဆုံး ပေ ၁၀၀ ထက်မကျော်ရပါ" : "Feet length cannot exceed 100")
            .refine((v) => Number(v.trim()) > 3 && Number(v.trim()) < 101, {
                message: locale === "mm" ? "4 ပေမှ 100 ပေအထိသာ" : "From 4-100 feet"
            }),
        fuelType: z
            .string()
            .min(1, locale === "mm" ? "စက်သုံးဆီ ရွေးချယ်ပေးပါ" : "Fuel type is required")
            .refine((val) => FUEL_TYPES.includes(val as (typeof FUEL_TYPES)[number]), {
                message:
                    locale === "mm" ? "စက်သုံးဆီ ရွေးချယ်ပေးပါ" : "Fuel type is required",
            }),
        frontTire: z
            .string()
            .min(1, locale === "mm" ? "ရှေ့တာယာဆိုဒ် လိုအပ်သည်" : "Front tire size is required")
            .max(100, locale === "mm" ? "ရှေ့တာယာဆိုဒ်သည် စာလုံး 100 ထက်မကျော်ရပါ" : "Front tire size cannot exceed 100 characters"),
        backTire: z
            .string()
            .min(1, locale === "mm" ? "နောက်တာယာဆိုဒ် လိုအပ်သည်" : "Back tire size is required")
            .max(100, locale === "mm" ? "နောက်တာယာဆိုဒ်သည် စာလုံး 100 ထက်မကျော်ရပါ" : "Back tire size cannot exceed 100 characters"),
        chassisNo: z
            .string()
            .max(100, locale === "mm" ? "ကိုယ်ထည်နံပါတ်သည် စာလုံး 100 ထက်မကျော်ရပါ" : "Chassis number cannot exceed 100 characters")
            .optional()
            .or(z.literal("").or(z.null())),
        engineNo: z
            .string()
            .max(100, locale === "mm" ? "အင်ဂျင်နံပါတ်သည် စာလုံး 100 ထက်မကျော်ရပါ" : "Engine number cannot exceed 100 characters")
            .optional()
            .or(z.literal("").or(z.null())),
        equipmentName: z
            .string()
            .min(1, locale === "mm" ? "ကားအမည် လိုအပ်သည်" : "Equipment name is required",)
            .max(200, locale === "mm" ? "ကားအမည်သည် စာလုံး 200 ထက်မကျော်ရပါ": "Equipment name cannot exceed 200 characters",),
        buyDate: z
            .string()
            .min(1, locale === "mm" ? "ဝယ်ယူရက် လိုအပ်သည်" : "Buy date is required")
            .refine((value) => !!toIsoDate(value), {message: DATE_MSG[locale]}),
        licenseCity: z
            .string()
            .min(1, locale === "mm" ? "လိုင်စင်မြို့ လိုအပ်သည်" : "License city is required",)
            .max(100, locale === "mm" ? "လိုင်စင်မြို့သည် စာလုံး 100 ထက်မကျော်ရပါ" : "License city cannot exceed 100 characters"),
        licenseEndDate: z
            .string()
            .min(1,locale === "mm"? "လိုင်စင်ကုန်ဆုံးရက် လိုအပ်သည်": "License end date is required")
            .refine((value) => !!toIsoDate(value), {message: DATE_MSG[locale]}),
        estimatedSellAmt: z
            .string()
            .max(200,locale === "mm"? "ခန့်မှန်းရောင်းဈေးသည် စာလုံး 200 ထက်မကျော်ရပါ": "Estimated sell amount cannot exceed 200 characters")
            .optional()
            .or(z.literal("").or(z.null())),
        purchasePlace: z
            .string()
            .min(1,locale === "mm"? "ဝယ်ယူသည့်နေရာ လိုအပ်သည်": "Purchase place is required",)
            .max( 200,locale === "mm"? "ဝယ်ယူသည့်နေရာသည် စာလုံး 200 ထက်မကျော်ရပါ": "Purchase place cannot exceed 200 characters"),
        notes: z
            .string()
            .max(500,locale === "mm"? "အသေးစိတ် အချက်အလက်သည် စာလုံး 500 ထက်မကျော်ရပါ": "Notes cannot exceed 500 characters",)
            .optional()
            .or(z.literal("").or(z.null())),
    });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

type TextFieldKey = keyof Omit<
    FormValues,
    "fuelType" | "ownerId" | "buyDate" | "licenseEndDate"
>;

type DateFieldKey = "buyDate" | "licenseEndDate";

function normalizeFuelType(value: unknown): string {
    const raw = String(value ?? "").trim().toUpperCase();
    if (FUEL_TYPES.includes(raw as (typeof FUEL_TYPES)[number])) {
        return raw;
    }
    return "DIESEL";
}

export default function OwnershipCreateScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const locale = useLocaleStore((state) => state.locale);
    const role = useAuthStore((state) => state.role);
    const userId = useAuthStore((state) => state.userId);
    const params = useLocalSearchParams<{ source?: string; plateNo?: string }>();

    const source = String(params.source ?? "manual");
    const plateNoParam = String(params.plateNo ?? "").trim().toUpperCase();
    const isSearchMode = source === "search" && !!plateNoParam;

    const upperRole = (role || "").toUpperCase();
    const showOwnerId = upperRole === "ADMIN";

    const {createOwnership: t} = useTranslation("ownership");
    const {fuelTypes} = useTranslation("lookup");
    const errorCatalog = useTranslation("error");
    const {mutate, isPending} = usePurchaseOwnership();
    const {data: ownerOptions = []} = useOwnerLookupOptions("",showOwnerId);
    const {data: truck} = useTruckByPlateNo(plateNoParam, isSearchMode);

    const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
    const style = locale === "mm" ? mmTextStyle : undefined;
    const mmLeading = getMyanmarLeadingClass(locale);

    const schema = useMemo(
        () => buildSchema(locale, showOwnerId),
        [locale, showOwnerId],
    );

    const {
        control,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            ownerId: "",
            plateNo: "",
            model: "",
            modelYear: "",
            feet: "",
            fuelType: "DIESEL",
            frontTire: "",
            backTire: "",
            chassisNo: "",
            engineNo: "",
            equipmentName: "",
            buyDate: "",
            licenseCity: "",
            licenseEndDate: "",
            estimatedSellAmt: "",
            purchasePlace: "",
            notes: "",
        },
    });

    useEffect(() => {
        if (!isSearchMode || !truck) return;

        reset({
            ownerId: "",
            plateNo: String(truck.plateNo ?? plateNoParam).trim().toUpperCase(),
            model: String(truck.model ?? "").trim(),
            modelYear: String(truck.modelYear ?? "").trim(),
            feet: String(truck.feet ?? "").trim(),
            fuelType: normalizeFuelType(truck.fuelType),
            frontTire: String(truck.frontTire ?? "").trim(),
            backTire: String(truck.backTire ?? "").trim(),
            chassisNo: String(truck.chassisNo ?? "").trim(),
            engineNo: String(truck.engineNo ?? "").trim(),
            equipmentName: [
                truck.modelYear,
                truck.model,
                truck.feet
                    ? `${truck.feet} ${locale === "mm" ? "ပေ" : "ft"}`
                    : "",
            ]
                .filter(Boolean)
                .join(" ")
                .trim(),
            buyDate: "",
            licenseCity: "",
            licenseEndDate: "",
            estimatedSellAmt: "",
            purchasePlace: "",
            notes: "",
        });
    }, [isSearchMode, truck, plateNoParam, reset, locale]);

    const fuelTypeFilterOptions = useMemo(() => {
        return Object.entries(fuelTypes || {}).map(([key, localizedValue]) => ({
            value: key,
            label: localizedValue,
        }));
    }, [fuelTypes]);

    const ownerSelectOptions = useMemo(
        () =>
            ownerOptions.map((option) => ({
                value: option.value,
                label: option.label,
            })),
        [ownerOptions],
    );

    const onBack = useCallback(() => {
        router.back();
    }, [router]);

    const onSubmit = (values: FormValues) => {


        const ownerId = showOwnerId ? values.ownerId?.trim() : userId?.trim();
        const buyDateIso = toIsoDate(values.buyDate);
        const licenseEndDateIso = toIsoDate(values.licenseEndDate);
        if (!buyDateIso || !licenseEndDateIso) {
            Alert.alert(t.dialog.errorTitle, t.dialog.errorBody);
            return;
        }

        mutate(
            {
                ownerId,
                plateNo: values.plateNo.trim(),
                model: values.model.trim(),
                modelYear: Number(values.modelYear),
                feet: Number(values.feet),
                fuelType: values.fuelType.trim(),
                frontTire: values.frontTire.trim(),
                backTire: values.backTire.trim(),
                chassisNo: values.chassisNo?.trim() || undefined,
                engineNo: values.engineNo?.trim() || undefined,
                equipmentName: values.equipmentName.trim(),
                buyDate: buyDateIso,
                licenseCity: values.licenseCity.trim(),
                licenseEndDate: licenseEndDateIso,
                estimatedSellAmt: values.estimatedSellAmt?.trim() || undefined,
                purchasePlace: values.purchasePlace.trim(),
                notes: values.notes?.trim() || undefined,
            },
            {
                onSuccess: () => {
                    Alert.alert(t.dialog.successTitle, t.dialog.successBody);
                    router.replace("/(tabs)/ownership" as Href);
                },
                onError: (err: unknown) => {
                    const {title, message} = getApiErrorAlertCopy(err, errorCatalog, {
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
            required?: boolean;
            keyboardType?: "number-pad";
            multiline?: boolean;
            autoCapitalize?: "none" | "characters";
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
                {options?.required ? null : (
                    <Text
                        className={`text-[11px] font-medium ${mmLeading}`}
                        style={{color: APP_COLORS.warning}}
                    >
                        {locale === "mm" ? "(မထည့်လည်းရ)" : "(Optional)"}
                    </Text>
                )}
            </View>
            <Controller
                control={control}
                name={key}
                render={({field: {onChange, value}}) => (
                    <Input
                        value={String(value ?? "")}
                        onChangeText={onChange}
                        keyboardType={options?.keyboardType}
                        multiline={options?.multiline}
                        scrollEnabled={!!options?.multiline}
                        numberOfLines={options?.multiline ? 4 : 1}
                        textAlignVertical={options?.multiline ? "top" : "center"}
                        placeholder={t.placeholders[key]}
                        placeholderTextColor={APP_COLORS.textMuted}
                        autoCapitalize={options?.autoCapitalize}
                        style={[
                            {
                                backgroundColor: APP_COLORS.inputBackground,
                                borderColor: errors[key] ? APP_COLORS.error : APP_COLORS.border,
                                borderWidth: 1,
                                color: APP_COLORS.textPrimary,
                                minHeight: options?.multiline ? 96 : undefined,
                            },
                            style,
                        ]}
                        className={`py-0 text-base font-medium ${mmLeading} ${options?.multiline ? "pt-3" : "h-12"}`}
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

    const renderDateInput = (key: DateFieldKey) => (
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
                render={({field: {onChange, value}}) => (
                    <ServiceDatePicker
                        locale={locale}
                        value={String(value ?? "")}
                        onChange={onChange}
                        placeholder={t.placeholders[key]}
                        doneLabel={locale === "mm" ? "ရွေးချယ်မည်" : "Done"}
                        mode="date"
                        style={style}
                        triggerClassName={`h-12 px-3 ${mmLeading}`}
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

    return (
        <SafeAreaView
            className="flex-1"
            style={{backgroundColor: APP_COLORS.background}}
        >
            {/* back button , page title */}
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

            <ScrollView
                className="px-4"
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 80,
                    flexGrow: 1,
                }}
            >
                {/* owner , basic info, tire info , ownership info */}
                <View className="mt-1 gap-4">

                    {/* owner */}
                    {showOwnerId ? (
                        <View
                            className="rounded-2xl p-4"
                            style={{
                                backgroundColor: APP_COLORS.card,
                                borderColor: APP_COLORS.border,
                                borderWidth: 1,
                            }}
                        >
                            <View className="gap-1.5">
                                <Text
                                    className={`text-sm font-medium ${mmLeading}`}
                                    style={[{color: APP_COLORS.textSecondary}, style]}
                                >
                                    {t.labels.ownerId}
                                </Text>
                                <Controller
                                    control={control}
                                    name="ownerId"
                                    render={({field: {value, onChange}}) => {
                                        const selectedOption = ownerSelectOptions.find(
                                            (opt) => opt.value === value,
                                        );
                                        const selectedLabel = selectedOption?.label ?? "";

                                        return (
                                            <Select
                                                value={
                                                    value
                                                        ? {value, label: selectedLabel}
                                                        : undefined
                                                }
                                                onValueChange={(next) => {
                                                    if (next && !Array.isArray(next)) {
                                                        onChange(next.value);
                                                    }
                                                }}
                                            >
                                                <Select.Trigger
                                                    className={`h-14 rounded-xl px-2.5 py-0 ${mmLeading}`}
                                                    style={{
                                                        backgroundColor: APP_COLORS.inputBackground,
                                                        borderColor: errors.ownerId
                                                            ? APP_COLORS.error
                                                            : APP_COLORS.border,
                                                        borderWidth: 1,
                                                    }}
                                                >
                                                    <Select.Value
                                                        placeholder={t.placeholders.ownerId}
                                                        className={`py-0 text-base font-medium ${mmLeading}`}
                                                        style={{color: APP_COLORS.textPrimary}}
                                                    />
                                                    <Select.TriggerIndicator/>
                                                </Select.Trigger>
                                                <Select.Portal>
                                                    <Select.Overlay/>
                                                    <Select.Content
                                                        className="rounded-2xl"
                                                        style={{
                                                            backgroundColor: APP_COLORS.card,
                                                            borderColor: APP_COLORS.border,
                                                            borderWidth: 1,
                                                        }}
                                                        presentation="popover"
                                                        width="trigger"
                                                    >
                                                        {ownerSelectOptions.map((option) => {
                                                            const isSelected = option.value === value;
                                                            return (
                                                                <Select.Item
                                                                    key={option.value}
                                                                    value={option.value}
                                                                    label={option.label}
                                                                    style={{
                                                                        backgroundColor: isSelected
                                                                            ? APP_COLORS.primarySoft
                                                                            : "transparent",
                                                                        paddingVertical: 12,
                                                                        paddingHorizontal: 16,
                                                                    }}
                                                                >
                                                                    <Select.ItemLabel
                                                                        className={`text-sm font-medium ${mmLeading}`}
                                                                        style={[
                                                                            style,
                                                                            {
                                                                                color: isSelected
                                                                                    ? APP_COLORS.primary
                                                                                    : APP_COLORS.textPrimary,
                                                                                fontWeight: isSelected ? "600" : "400",
                                                                            },
                                                                        ]}
                                                                    />
                                                                    <Select.ItemIndicator/>
                                                                </Select.Item>
                                                            );
                                                        })}
                                                    </Select.Content>
                                                </Select.Portal>
                                            </Select>
                                        );
                                    }}
                                />
                                {!!errors.ownerId?.message && (
                                    <Text
                                        className={`text-xs font-normal ${mmLeading}`}
                                        style={[{color: APP_COLORS.error}, style]}
                                    >
                                        {String(errors.ownerId.message)}
                                    </Text>
                                )}
                            </View>
                        </View>
                    ) : null}

                    {/* basic info */}
                    <View
                        className="rounded-2xl p-4"
                        style={{
                            backgroundColor: APP_COLORS.card,
                            borderColor: APP_COLORS.border,
                            borderWidth: 1,
                        }}
                    >
                        <View className="gap-3">
                            {/* info title */}
                            <Text
                                className={`text-sm font-bold ${mmLeading}`}
                                style={[style, {color: APP_COLORS.textPrimary}]}
                            >
                                {t.basicInfoTitle}
                            </Text>

                            {/* plate no. */}
                            {renderTextInput("plateNo", {required: true,autoCapitalize: "characters"})}

                            {/* feet , model year */}
                            <View className="flex-row gap-2">
                                <View className="flex-1">
                                    {renderTextInput("feet", {
                                        required: true,
                                        keyboardType: "number-pad",
                                    })}
                                </View>
                                <View className="flex-1">
                                    {renderTextInput("modelYear", {
                                        required: true,
                                        keyboardType: "number-pad",
                                    })}
                                </View>
                            </View>

                            {/* model  */}
                            {renderTextInput("model", {required: true})}

                            {/* fuel type */}
                            <View className="gap-1.5">
                                <Text
                                    className={`text-sm font-medium ${mmLeading}`}
                                    style={[{color: APP_COLORS.textSecondary}, style]}
                                >
                                    {t.labels.fuelType}
                                </Text>
                                <Controller
                                    control={control}
                                    name="fuelType"
                                    render={({field: {value, onChange}}) => {
                                        const selectedOption = fuelTypeFilterOptions.find(
                                            (item) => item.value === value,
                                        );
                                        const selectedLabel = selectedOption?.label;

                                        return (
                                            <Select
                                                value={{
                                                    value,
                                                    label: selectedLabel ? selectedLabel : "",
                                                }}
                                                onValueChange={(next) => {
                                                    if (next && !Array.isArray(next)) {
                                                        onChange(next.value as FormValues["fuelType"]);
                                                    }
                                                }}
                                            >
                                                <Select.Trigger
                                                    className={`h-14 rounded-xl px-2.5 py-0 ${mmLeading}`}
                                                    style={{
                                                        backgroundColor: APP_COLORS.inputBackground,
                                                        borderColor: errors.fuelType ? APP_COLORS.error : APP_COLORS.border,
                                                        borderWidth: 1,
                                                    }}
                                                >
                                                    <Select.Value
                                                        placeholder={t.placeholders.fuelType}
                                                        className={`py-0 text-base font-medium ${mmLeading}`}
                                                        style={[style,{color: APP_COLORS.textPrimary}]}
                                                    />
                                                    <Select.TriggerIndicator/>
                                                </Select.Trigger>
                                                <Select.Portal>
                                                    <Select.Overlay/>
                                                    <Select.Content
                                                        className="rounded-2xl"
                                                        style={{
                                                            backgroundColor: APP_COLORS.card,
                                                            borderColor: APP_COLORS.border,
                                                            borderWidth: 1,
                                                        }}
                                                        presentation="popover"
                                                        width="trigger"
                                                    >
                                                        {fuelTypeFilterOptions.map((fuelType) => {
                                                            const isSelected = fuelType.value === value;
                                                            return (
                                                                <Select.Item
                                                                    key={fuelType.value}
                                                                    value={fuelType.value}
                                                                    label={fuelType.label}
                                                                    style={{
                                                                        backgroundColor: isSelected ? APP_COLORS.primarySoft : "transparent",
                                                                        paddingVertical: 12,
                                                                        paddingHorizontal: 16,
                                                                    }}
                                                                >
                                                                    <Select.ItemLabel
                                                                        className={`text-sm font-medium ${mmLeading}`}
                                                                        style={[
                                                                            style,
                                                                            {
                                                                                color: isSelected ? APP_COLORS.primary : APP_COLORS.textPrimary,
                                                                                fontWeight: isSelected ? "600" : "400",
                                                                            },
                                                                        ]}
                                                                    />
                                                                    <Select.ItemIndicator/>
                                                                </Select.Item>
                                                            );
                                                        })}
                                                    </Select.Content>
                                                </Select.Portal>
                                            </Select>
                                        );
                                    }}
                                />
                                {!!errors.fuelType?.message && (
                                    <Text
                                        className={`text-xs font-normal ${mmLeading}`}
                                        style={[{color: APP_COLORS.error}, style]}
                                    >
                                        {String(errors.fuelType.message)}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* tire and other info */}
                    <View
                        className="rounded-2xl p-4"
                        style={{
                            backgroundColor: APP_COLORS.card,
                            borderColor: APP_COLORS.border,
                            borderWidth: 1,
                        }}
                    >
                        <View className="gap-3">
                            {/* info title */}
                            <Text
                                className={`text-sm font-bold ${mmLeading}`}
                                style={[style, {color: APP_COLORS.textPrimary}]}
                            >
                                {t.tireAndExtraTitle}
                            </Text>

                            {/* f tire , b tire */}
                            <View className="flex-row gap-2">
                                <View className="flex-1">
                                    {renderTextInput("frontTire", {required: true})}
                                </View>
                                <View className="flex-1">
                                    {renderTextInput("backTire", {required: true})}
                                </View>
                            </View>

                            {/* chassi no. */}
                            {renderTextInput("chassisNo")}
                            {/*engine no. */}
                            {renderTextInput("engineNo")}
                        </View>
                    </View>

                    {/* ownership info */}
                    <View
                        className="rounded-2xl p-4"
                        style={{
                            backgroundColor: APP_COLORS.card,
                            borderColor: APP_COLORS.border,
                            borderWidth: 1,
                        }}
                    >
                        <View className="gap-3">
                            {/* ownership info title */}
                            <Text
                                className={`text-sm font-bold ${mmLeading}`}
                                style={[style, {color: APP_COLORS.textPrimary}]}
                            >
                                {t.ownershipDetailsTitle}
                            </Text>

                            {/* equipment name */}
                            {renderTextInput("equipmentName", {required: true})}

                            {/* license city */}
                            {renderTextInput("licenseCity", {required: true})}

                            {/* purchase place */}
                            {renderTextInput("purchasePlace", {required: true})}

                            {/* license end date , buy date */}
                            <View className="flex-row gap-2">
                                <View className="flex-1">{renderDateInput("licenseEndDate")}</View>
                                <View className="flex-1">{renderDateInput("buyDate")}</View>
                            </View>


                            {renderTextInput("estimatedSellAmt")}
                            {renderTextInput("notes", {multiline: true})}
                        </View>
                    </View>
                </View>

                <Button
                    onPress={handleSubmit(onSubmit)}
                    isDisabled={isPending}
                    className={`mb-2 mt-5 items-center justify-center rounded-xl ${mmLeading}`}
                    style={[style,{backgroundColor: APP_COLORS.primary}]}
                    animation={{
                        highlight: {
                            backgroundColor: {
                                value: APP_COLORS.primaryPressed, // Safely injects #456385 on click!
                            }
                        },
                    }}
                >
                    <View className="flex-row items-center gap-2">
                        <Ionicons name="checkmark" size={18} color="#FFFFFF"/>
                        <Text
                            className={`text-sm font-bold text-white ${mmLeading}`}
                            style={style}
                        >
                            {isPending ? t.actions.submitting : t.actions.submit}
                        </Text>
                    </View>
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
}
