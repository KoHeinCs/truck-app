import {ServiceDatePicker} from "@/components/service-date-picker";
import {APP_COLORS} from "@/constants/colors";
import {getMyanmarLeadingClass, myanmarUITextStyle} from "@/constants/myanmar-font";
import {useTranslation} from "@/hooks/use-translation";
import {getApiErrorAlertCopy} from "@/lib/api-error-alert";
import {useLocaleStore, type AppLocale} from "@/stores/client/locale-store";
import {useProposalDetail} from "@/stores/server/proposal/query";
import type {ProposalDetail} from "@/stores/server/proposal/typed";
import {useUpdateProposal} from "@/stores/server/proposal/update-mutation";
import {useServiceTypeLookup} from "@/stores/server/service-type/lookup-query";
import {
    getSelectedServiceType,
    getServiceTypeLabel,
} from "@/utils/service-type-label";
import {
    parseServiceDateApiToDisplay,
    parseServiceDateDisplayToApi,
} from "@/utils/service-date";
import Ionicons from "@expo/vector-icons/Ionicons";
import {zodResolver} from "@hookform/resolvers/zod";
import {useLocalSearchParams, useRouter} from "expo-router";
import {Input, Select} from "heroui-native";
import React, {useCallback, useEffect, useMemo} from "react";
import {Controller, useForm,Control} from "react-hook-form";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import {useQueryClient} from "@tanstack/react-query";
import {z} from "zod";


function buildSchema(locale: "en" | "mm") {

    return z.object({
        proposalAmount: z
            .string()
            .min(1, locale === "mm" ? "ကျသင့်ပမာဏ လိုအပ်သည်" : "Proposal amount is required")
            .refine((value) => /^\d{1,9}(\.\d{1,2})?$/.test(value.trim()), {
                message: locale === "mm" ? "ပမာဏမှားယွင်းနေသည် (အများဆုံး ၉ လုံး)" : "Invalid format (max 9 digits)",
            }),
        serviceType: z.string()
            .min(1, locale === "mm" ? "ပြင်ဆင်မှုအမျိုးအစား လိုအပ်သည်" : "Service type is required"),
        serviceShop: z.string()
            .min(1, locale === "mm" ? "ဝပ်ရှော့အမည် လိုအပ်သည်" : "Service shop is required")
            .max(200, locale === "mm" ? "ဝပ်ရှော့အမည်သည် စာလုံး ၂၀၀ ထက်မကျော်ရပါ" : "Service shop cannot exceed 200 characters"),
        serviceDate: z
            .string()
            .min(1, locale === "mm" ? "ပြင်ဆင်သည့်ရက် လိုအပ်သည်" : "Service date is required")
            .refine((value) => parseServiceDateDisplayToApi(value) !== null, {
                message: locale === "mm" ? "ရက်/လ/ခုနှစ် နာရီ:မိနစ် သုံးပါ" : "Use correct format date dd/mm/yyyy HH:mm",
            }),
        description: z.string()
            .min(1, locale === "mm" ? "အသေးစိတ်အချက်အလက် လိုအပ်သည်" : "Description is required")
            .max(500, locale === "mm" ? "အသေးစိတ်အချက်အလက်သည် စာလုံး 500 ထက်မကျော်ရပါ" : "Description cannot exceed 500 characters"),
        remark: z.string()
            .min(1, locale === "mm" ? "မှတ်ချက် ထည့်သွင်းရန် လိုအပ်သည်" : "Remark is required")
            .max(500, locale === "mm" ? "မှတ်ချက်သည် စာလုံး 500 ထက်မကျော်ရပါ" : "Remark cannot exceed 500 characters"),
    });

}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;


function getOwnershipId(
    detail: ProposalDetail | undefined,
    fallback: string,
): string {
    return String(detail?.ownershipRefId ?? fallback).trim();
}

export default function EditProposalScreen() {
    const router = useRouter();
    const qc = useQueryClient();
    const insets = useSafeAreaInsets();
    const locale = useLocaleStore((state) => state.locale);
    const errorCatalog = useTranslation("error");

    const {editProposal: t} = useTranslation('proposal')
    const params = useLocalSearchParams<{
        proposalNo?: string;
        ownershipId?: string;
    }>();
    const proposalNo = String(params.proposalNo ?? "").trim();
    const ownershipId = String(params.ownershipId ?? "").trim();
    const {data, isPending: isDetailPending} = useProposalDetail(
        proposalNo,
        ownershipId,
    );
    const detail = data?.data;
    const {mutate, isPending} = useUpdateProposal();

    const mmLeading = getMyanmarLeadingClass(locale);
    const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
    const style = locale === "mm" ? mmTextStyle : undefined;
    const schema = useMemo(() => buildSchema(locale), [locale]);

    const {
        control,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            proposalAmount: "",
            serviceType: "",
            serviceShop: "",
            serviceDate: "",
            description: "",
            remark: "",
        },
    });

    useEffect(() => {
        if (!detail) return;
        reset({
            proposalAmount: String(detail.proposalAmount ?? ""),
            serviceType: detail.serviceType ?? "",
            serviceShop: detail.serviceShop ?? "",
            serviceDate: parseServiceDateApiToDisplay(detail.serviceDate ?? ""),
            description: detail.description ?? "",
            remark: "",
        });
    }, [detail, reset]);

    const {serviceTypes} = useServiceTypeLookup();

    const onBack = useCallback(() => {
        qc.invalidateQueries({queryKey: ["proposal"]});
        router.back();
    }, [qc, router]);

    const onSubmit = (values: FormValues) => {
        if (!detail?.id) return;

        const serviceDate = parseServiceDateDisplayToApi(values.serviceDate);
        if (!serviceDate) return;

        mutate(
            {
                id: detail.id,
                version: detail.version,
                ownershipId: getOwnershipId(detail, ownershipId),
                proposalAmount: Number(values.proposalAmount),
                serviceType: values.serviceType,
                serviceShop: values.serviceShop.trim(),
                serviceDate,
                description: values.description.trim(),
                remark: values.remark.trim(),
            },
            {
                onSuccess: () => {
                    Alert.alert(t.dialog.successTitle, t.dialog.successBody, [
                        {text: t.actions.done, onPress: () => router.back()},
                    ]);
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

    return (
        <SafeAreaView
            className="flex-1"
            style={{backgroundColor: APP_COLORS.background, flex: 1}}>

            {/* back button , page title */}
            <View className="flex-row items-center px-4 pb-3 pt-1">
                <Pressable
                    onPress={onBack}
                    className="h-11 w-11 items-center justify-center rounded-full "
                    style={({pressed}) => ({
                        backgroundColor: pressed ? APP_COLORS.primary : APP_COLORS.background
                    })}>
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

            {/* edit form */}
            {
                isDetailPending ?
                    (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator color={APP_COLORS.primary}/>
                        </View>
                    ) :
                    (
                        <KeyboardAvoidingView
                            className="flex-1"
                            style={{flex : 1}}
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
                                className="mt-1 rounded-2xl  p-4"
                                style={{
                                    backgroundColor: APP_COLORS.card,
                                    borderColor: APP_COLORS.border,
                                    borderWidth: 1
                                }}
                            >

                                {/* proposal number */}
                                <View className="mb-4 gap-1">
                                    <Text
                                        className={`text-sm font-medium ${mmLeading}`}
                                        style={[style, {color: APP_COLORS.textSecondary}]}
                                    >
                                        {t.labels.proposalNo}
                                    </Text>
                                    <Text
                                        className={`text-base font-medium  ${mmLeading}`}
                                        style={[style, {color: APP_COLORS.textPrimary}]}
                                    >
                                        {detail?.proposalNo || "-"}
                                    </Text>
                                </View>

                                <View className="gap-4">

                                    {/* proposal amount input field */}
                                    <FormInput
                                        control={control}
                                        name="proposalAmount"
                                        label={t.labels.amount}
                                        placeholder={t.placeholders.amount}
                                        locale={locale}
                                        keyboardType="decimal-pad"
                                        required
                                        error={errors.proposalAmount?.message}
                                        mmLeading={mmLeading}
                                        style={style}
                                    />

                                    {/* service type select box */}
                                    <Controller
                                        control={control}
                                        name="serviceType"
                                        render={({field: {value, onChange}}) => (
                                            <View className="gap-2">
                                                <RequiredLabel
                                                    label={t.labels.serviceType}
                                                    mmLeading={mmLeading}
                                                    style={style}
                                                />
                                                <Select
                                                    value={getSelectedServiceType(value, serviceTypes, locale)}
                                                    onValueChange={(next) => {
                                                        if (next && !Array.isArray(next)) {
                                                            onChange(next.value);
                                                        }
                                                    }}
                                                >
                                                    <Select.Trigger
                                                        className={`p-3 ${mmLeading} `}
                                                        style={{
                                                            backgroundColor: APP_COLORS.inputBackground,
                                                            borderColor: APP_COLORS.border,
                                                            borderWidth: 1
                                                        }}
                                                    >
                                                        <Select.Value
                                                            placeholder={t.placeholders.serviceType}
                                                            className={`text-base font-medium ${mmLeading}`}
                                                            style={[{color: APP_COLORS.textPrimary}, style]}
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
                                                                borderWidth: 1
                                                            }}
                                                            presentation="popover"
                                                            width="trigger"
                                                        >
                                                            {serviceTypes.map((serviceType) => {
                                                                    const itemLabel = getServiceTypeLabel(serviceType, locale);
                                                                    const isSelected = serviceType.serviceType === value;

                                                                    return (
                                                                        <Select.Item
                                                                            className=" text-xs"
                                                                            key={String(serviceType.id)}
                                                                            value={serviceType.serviceType}
                                                                            label={itemLabel}
                                                                            style={{
                                                                                backgroundColor: isSelected ? APP_COLORS.primarySoft : 'transparent',
                                                                                paddingVertical: 12,
                                                                                paddingHorizontal: 16,
                                                                            }}
                                                                        >
                                                                            <Select.ItemLabel
                                                                                className={`text-xs ${mmLeading}`}
                                                                                style={[{
                                                                                    color: isSelected ? APP_COLORS.primary : APP_COLORS.textPrimary,
                                                                                    fontWeight: isSelected ? "600" : "400"
                                                                                }, style]}
                                                                            />
                                                                            <Select.ItemIndicator/>
                                                                        </Select.Item>
                                                                    )
                                                                }
                                                            )}
                                                        </Select.Content>
                                                    </Select.Portal>
                                                </Select>
                                                {!!errors.serviceType?.message && (
                                                    <Text
                                                        className={`text-xs font-normal ${mmLeading}`}
                                                        style={[{color: APP_COLORS.error}, style]}
                                                    >
                                                        {String(errors.serviceType.message)}
                                                    </Text>
                                                )}
                                            </View>
                                        )}
                                    />

                                    {/* service date */}
                                    <Controller
                                        control={control}
                                        name="serviceDate"
                                        render={({field: {value, onChange}}) => (
                                            <View className="gap-2">
                                                <RequiredLabel
                                                    label={t.labels.serviceDate}
                                                    mmLeading={mmLeading}
                                                    style={style}
                                                />
                                                <ServiceDatePicker
                                                    value={value}
                                                    onChange={onChange}
                                                    placeholder={t.placeholders.serviceDate}
                                                    doneLabel={locale === "mm" ? "ရွေးချယ်မည်" : "Done"}
                                                    locale={locale}
                                                    style={style}
                                                    maximumDate={new Date()}
                                                />
                                                {!!errors.serviceDate?.message && (
                                                    <Text
                                                        className={`text-xs font-normal ${mmLeading}`}
                                                        style={[{color: APP_COLORS.error}, style]}
                                                    >
                                                        {String(errors.serviceDate.message)}
                                                    </Text>
                                                )}
                                            </View>
                                        )}
                                    />

                                    {/* service shop input field */}
                                    <FormInput
                                        control={control}
                                        name="serviceShop"
                                        label={t.labels.serviceShop}
                                        placeholder={t.placeholders.serviceShop}
                                        locale={locale}
                                        required
                                        error={errors.serviceShop?.message}
                                        mmLeading={mmLeading}
                                        style={style}
                                    />

                                    {/* description */}
                                    <Controller
                                        control={control}
                                        name="description"
                                        render={({field: {value, onChange}}) => (
                                            <View className="gap-2">
                                                <RequiredLabel
                                                    label={t.labels.description}
                                                    mmLeading={mmLeading}
                                                    style={style}
                                                />
                                                <TextInput
                                                    value={value}
                                                    onChangeText={onChange}
                                                    placeholder={t.placeholders.description}
                                                    placeholderTextColor={APP_COLORS.textMuted}
                                                    multiline={true}
                                                    numberOfLines={4}
                                                    scrollEnabled={true}
                                                    maxLength={511}
                                                    textAlignVertical="top"
                                                    className={`min-h-[126px] rounded-xl p-3 text-base font-medium ${mmLeading}`}
                                                    style={[style, {
                                                        backgroundColor: APP_COLORS.inputBackground,
                                                        borderColor: errors.description ? APP_COLORS.error : APP_COLORS.border,
                                                        borderWidth: 1,
                                                        color: APP_COLORS.textPrimary
                                                    }]}
                                                />
                                                {!!errors.description?.message && (
                                                    <Text
                                                        className={`text-xs font-normal ${mmLeading}`}
                                                        style={[{color: APP_COLORS.error}, style]}
                                                    >
                                                        {String(errors.description.message)}
                                                    </Text>
                                                )}
                                            </View>
                                        )}
                                    />

                                    {/* remark */}
                                    <FormInput
                                        control={control}
                                        name="remark"
                                        label={t.labels.remark}
                                        placeholder={t.placeholders.remark}
                                        locale={locale}
                                        required
                                        error={errors.remark?.message}
                                        mmLeading={mmLeading}
                                        style={style}
                                    />

                                    {/* back && submit button */}
                                    <View className="flex-row gap-3 pt-2">
                                        <Pressable
                                            onPress={onBack}
                                            disabled={isPending}
                                            className="flex-1 items-center justify-center rounded-xl  h-13 "
                                            style={({pressed}) => ({
                                                backgroundColor: pressed ? APP_COLORS.errorSoft : 'transparent',
                                                opacity: isPending ? 0.7 : 1,
                                                borderColor: APP_COLORS.border,
                                                borderWidth: 1
                                            })}
                                        >
                                            <Text
                                                className={`text-sm font-semibold text-slate-700 ${mmLeading}`}
                                                style={style}
                                            >
                                                {t.actions.cancel}
                                            </Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={handleSubmit(onSubmit)}
                                            disabled={isPending}
                                            className="flex-1 items-center justify-center rounded-xl h-13"
                                            style={({pressed}) => ({
                                                backgroundColor: pressed ? APP_COLORS.primaryPressed : APP_COLORS.primary,
                                                opacity: isPending ? 0.7 : 1,
                                                borderColor: APP_COLORS.border,
                                                borderWidth: 1
                                            })}
                                        >
                                            <Text
                                                className={`text-sm font-semibold text-white ${mmLeading}`}
                                                style={style}
                                            >
                                                {isPending ? t.actions.updating : t.actions.update}
                                            </Text>
                                        </Pressable>
                                    </View>

                                </View>
                            </View>
                        </ScrollView>

                        </KeyboardAvoidingView>
                    )
            }
        </SafeAreaView>
    );
}

type RequiredLabelProps = {
    label: string;
    mmLeading: string;
    style?: any
};

function RequiredLabel({label, mmLeading, style}: RequiredLabelProps) {
    return (
        <View className="flex-row items-center gap-1">
            <Text
                className={`text-sm font-medium  ${mmLeading}`}
                style={[style, {color: APP_COLORS.textSecondary}]}
            >
                {label}
            </Text>
        </View>
    );
}

type FormInputProps = {
    control: Control<FormValues>;
    name: keyof FormValues;
    label: string;
    placeholder: string;
    locale: AppLocale;
    keyboardType?: "decimal-pad";
    required?: boolean;
    error?: string;
    mmLeading: string;
    style?: any;
};

function FormInput({
                       control,
                       name,
                       label,
                       placeholder,
                       locale,
                       keyboardType,
                       required,
                       error,
                       mmLeading,
                       style
                   }: FormInputProps) {
    return (
        <Controller
            control={control}
            name={name}
            render={({field: {value, onChange}}) => (
                <View className="gap-2">
                    {required ? (
                        <RequiredLabel label={label} mmLeading={mmLeading} style={style}/>
                    ) : (
                        <Text
                            className={`text-sm font-medium  ${mmLeading}`}
                            style={[style, {color: APP_COLORS.textSecondary}]}
                        >
                            {label}
                        </Text>
                    )}
                    <Input
                        value={String(value ?? "")}
                        onChangeText={onChange}
                        placeholder={placeholder}
                        placeholderTextColor={APP_COLORS.textMuted}
                        keyboardType={keyboardType}
                        style={[{
                            backgroundColor: APP_COLORS.inputBackground,
                            borderColor: error ? APP_COLORS.error : APP_COLORS.border,
                            borderWidth: 1,
                            color: APP_COLORS.textPrimary
                        }, style]}
                        className={`p-3 text-base font-medium  ${mmLeading}`}
                    />
                    {!!error && (
                        <Text
                            className={`text-xs font-normal ${mmLeading}`}
                            style={[style, {color: APP_COLORS.error}]}
                        >
                            {String(error)}
                        </Text>
                    )}
                </View>
            )}
        />
    );
}
