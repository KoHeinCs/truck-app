import {ServiceDatePicker} from "@/components/service-date-picker";
import {APP_COLORS} from "@/constants/colors";
import {
    compactLineInputTextStyle,
    compactMultilineInputTextStyle,
} from "@/constants/compact-input";
import {getMyanmarLeadingClass} from "@/constants/myanmar-font";
import {useDebouncedValue} from "@/hooks/use-debounced-value";
import {useLocaleStore, type AppLocale} from "@/stores/client/locale-store";
import {useCreateProposal} from "@/stores/server/proposal/create-mutation";
import {buildServiceTypeSearchColumns} from "@/stores/server/service-type/search-columns";
import {useServiceTypesInfinite} from "@/stores/server/service-type/query";
import type {ServiceTypeItem} from "@/stores/server/service-type/typed";
import {useTruckSearchOptions} from "@/stores/server/truck/query";
import type {TruckItem} from "@/stores/server/truck/typed";
import {parseServiceDateDisplayToApi} from "@/utils/service-date";
import Ionicons from "@expo/vector-icons/Ionicons";
import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {isAxiosError} from "axios";
import {useRouter} from "expo-router";
import {Input, Select} from "heroui-native";
import React, {useCallback, useMemo, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {
    Alert,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import {z} from "zod";
import {useTranslation} from "@/hooks/use-translation";

type FormValues = {
    truckId: string;
    proposalAmount: string;
    serviceType: string;
    serviceShop: string;
    serviceDate: string;
    description: string;
};

type ReviewValues = FormValues;

function buildSchema(t: any) {
    return z.object({
        truckId: z.string().min(1, t.required),
        proposalAmount: z
            .string()
            .min(1, t.required)
            .refine((value) => /^\d{1,9}(\.\d{1,2})?$/.test(value.trim()), {
                message: t.invalidAmount,
            }),
        serviceType: z.string().min(1, t.required),
        serviceShop: z.string().min(1, t.required).max(100),
        serviceDate: z
            .string()
            .min(1, t.required)
            .refine((value) => parseServiceDateDisplayToApi(value) !== null, {
                message: t.invalidDate,
            }),
        description: z.string().max(1000),
    });
}

function getTruckSubtitle(item: TruckItem): string {
    const year = String(item.modelYear ?? "").trim();
    const model = String(item.model ?? "").trim();
    return [year, model].filter(Boolean).join(" ") || "-";
}

function matchesTruckQuery(item: TruckItem, query: string): boolean {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return true;

    return [item.plateNo, item.model, item.modelYear, item.make]
        .map((value) => String(value ?? "").toLowerCase())
        .some((value) => value.includes(normalizedQuery));
}

export default function CreateProposalScreen() {
    const router = useRouter();
    const qc = useQueryClient();
    const insets = useSafeAreaInsets();
    const locale = useLocaleStore((state) => state.locale);
    const {createProposal: t} = useTranslation('proposal')
    const {mutate, isPending} = useCreateProposal();
    const [truckQuery, setTruckQuery] = useState("");
    const [truckPickerOpen, setTruckPickerOpen] = useState(false);
    const [reviewValues, setReviewValues] = useState<ReviewValues | null>(null);
    const debouncedTruckQuery = useDebouncedValue(truckQuery, 400);

    const mmLeading = getMyanmarLeadingClass(locale);

    const schema = useMemo(() => buildSchema(t), [t]);
    const {
        control,
        handleSubmit,
        setValue,
        formState: {errors},
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            truckId: "",
            proposalAmount: "",
            serviceType: "",
            serviceShop: "",
            serviceDate: "",
            description: "",
        },
    });

    const {data: truckData} = useTruckSearchOptions();
    const trucks = useMemo(
        () =>
            (truckData?.data ?? []).filter((truck) =>
                matchesTruckQuery(truck, debouncedTruckQuery),
            ),
        [truckData, debouncedTruckQuery],
    );

    const serviceColumns = useMemo(
        () =>
            buildServiceTypeSearchColumns({
                quickQuery: "",
                active: true,
                langEng: "",
                langMy: "",
            }),
        [],
    );
    const {data: serviceTypeData} = useServiceTypesInfinite(serviceColumns);
    const serviceTypes = useMemo(
        () => serviceTypeData?.pages.flatMap((page) => page.data.data) ?? [],
        [serviceTypeData],
    );

    const onBack = useCallback(() => {
        qc.invalidateQueries({queryKey: ["proposal"]});
        router.back();
    }, [qc, router]);

    const createFromReview = (values: ReviewValues) => {
        const serviceDate = parseServiceDateDisplayToApi(values.serviceDate);
        if (!serviceDate) return;

        mutate(
            {
                truckId: values.truckId,
                proposalAmount: Number(values.proposalAmount),
                serviceType: values.serviceType,
                serviceShop: values.serviceShop.trim(),
                serviceDate,
                description: values.description.trim() || undefined,
            },
            {
                onSuccess: () => {
                    Alert.alert(t.dialog.successTitle, t.dialog.successBody, [
                        {text: t.actions.done, onPress: () => router.back()},
                    ]);
                },
                onError: (err: unknown) => {
                    const data = isAxiosError(err) ? err.response?.data : undefined;
                    const message =
                        data &&
                        typeof data === "object" &&
                        "message" in data &&
                        typeof (data as { message?: unknown }).message === "string"
                            ? (data as { message: string }).message
                            : t.dialog.errorBody;
                    Alert.alert(t.dialog.errorTitle, message);
                },
            },
        );
    };

    const onSubmit = (values: FormValues) => {
        setReviewValues(values);
        setTruckPickerOpen(false);
    };

    const selectedReviewTruck = reviewValues
        ? trucks.find((truck) => truck.id === reviewValues.truckId)
        : undefined;
    const selectedReviewServiceType = reviewValues
        ? serviceTypes.find((item) => item.serviceType === reviewValues.serviceType)
        : undefined;

    return (
        <SafeAreaView className="flex-1 bg-[#f3f7fb]">

            {/* back button , page title */}
            <View className="flex-row items-center px-4 pb-3 pt-1">
                <Pressable
                    onPress={onBack}
                    className="h-11 w-11 items-center justify-center rounded-full bg-[#f1f5f9]"
                >
                    <Ionicons name="arrow-back" size={22} color="#475569"/>
                </Pressable>
                <Text
                    className={`flex-1 px-3 text-center text-lg font-bold text-slate-900 ${mmLeading}`}
                >
                    {t.title}
                </Text>
                <View className="h-11 w-11"/>
            </View>

            {/* step1 form , step2/review form */}
            <ScrollView
                className="px-4"
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 80,
                    flexGrow: 1,
                }}
                keyboardShouldPersistTaps="handled"
            >
                <View className="mt-1 rounded-2xl bg-white p-4">
                    {/* preview page && create page */}
                    {
                        reviewValues ?
                            (
                                <View className="gap-4">

                                    {/* step2 form */}

                                    {/* review page title */}
                                    <Text
                                        className={`text-base font-bold text-slate-900 ${mmLeading}`}
                                    >
                                        {t.reviewTitle}
                                    </Text>

                                    {/* step2/review form */}
                                    <View className="rounded-2xl border border-slate-100 bg-slate-50 p-4">

                                        {/* selected truck info */}
                                        <View className="mb-3">
                                            <Text
                                                className={`text-xs text-slate-500 ${mmLeading}`}
                                            >
                                                {t.labels.truck}
                                            </Text>
                                            <Text
                                                className={`mt-1 text-base font-bold text-slate-900 ${mmLeading}`}
                                            >
                                                {selectedReviewTruck?.plateNo || truckQuery || "-"}
                                            </Text>
                                            <Text
                                                className={`mt-0.5 text-xs text-slate-500 ${mmLeading}`}
                                            >
                                                {selectedReviewTruck ? getTruckSubtitle(selectedReviewTruck) : "-"}
                                            </Text>
                                        </View>

                                        {/* other info */}
                                        <View className="border-t border-slate-200 pt-3">
                                            {/* amount */}
                                            <PreviewRow
                                                label={t.labels.amount}
                                                value={reviewValues.proposalAmount}
                                                mmLeading={mmLeading}
                                            />
                                            {/* service type */}
                                            <PreviewRow
                                                label={t.labels.serviceType}
                                                value={
                                                    selectedReviewServiceType
                                                        ? getServiceTypeLabel(selectedReviewServiceType, locale)
                                                        : reviewValues.serviceType
                                                }
                                                mmLeading={mmLeading}
                                            />
                                            {/* service shop */}
                                            <PreviewRow
                                                label={t.labels.serviceShop}
                                                value={reviewValues.serviceShop}
                                                mmLeading={mmLeading}
                                            />
                                            {/* service date */}
                                            <PreviewRow
                                                label={t.labels.serviceDate}
                                                value={reviewValues.serviceDate}
                                                mmLeading={mmLeading}
                                            />
                                            {/* description */}
                                            <PreviewRow
                                                label={t.labels.description}
                                                value={reviewValues.description || "-"}
                                                mmLeading={mmLeading}
                                                last
                                            />
                                        </View>

                                    </View>

                                    {/* step2 back && submit buttons */}
                                    <View className="flex-row gap-3 pt-2">
                                        <Pressable
                                            onPress={() => setReviewValues(null)}
                                            disabled={isPending}
                                            className="flex-1 items-center justify-center rounded-xl bg-slate-100 h-14"
                                        >
                                            <Text className={`font-semibold text-slate-700 ${mmLeading}`}>
                                                {t.actions.back}
                                            </Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => createFromReview(reviewValues)}
                                            disabled={isPending}
                                            className="flex-1 items-center justify-center rounded-xl h-14"
                                            style={{
                                                backgroundColor: APP_COLORS.primary,
                                                opacity: isPending ? 0.7 : 1,
                                            }}
                                        >
                                            <Text className={`font-semibold text-white ${mmLeading}`}>
                                                {isPending ? t.actions.submitting : t.actions.submit}
                                            </Text>
                                        </Pressable>
                                    </View>

                                </View>
                            ) :
                            (
                                <View className="gap-4">

                                    {/* step1 form */}

                                    {/* truck select box */}
                                    <Controller
                                        control={control}
                                        name="truckId"
                                        render={() => (
                                            <View className="gap-2">
                                                <RequiredLabel label={t.labels.truck} mmLeading={mmLeading}/>
                                                <Input
                                                    value={truckQuery}
                                                    onChangeText={(next) => {
                                                        setTruckQuery(next);
                                                        setTruckPickerOpen(true);
                                                        setValue("truckId", "");
                                                    }}
                                                    onFocus={() => setTruckPickerOpen(true)}
                                                    placeholder={t.placeholders.truck}
                                                    className={`border py-0 h-11 ${mmLeading} border-slate-200 bg-white ${truckPickerOpen ? "border-blue-500" : ""}`}
                                                />
                                                {!!errors.truckId?.message && (
                                                    <Text className={`text-xs text-red-500 ${mmLeading}`}>
                                                        {String(errors.truckId.message)}
                                                    </Text>
                                                )}
                                                {truckPickerOpen ? (
                                                    <View className="rounded-2xl border border-slate-200 bg-white p-3">
                                                        <Input
                                                            value={truckQuery}
                                                            onChangeText={(next) => {
                                                                setTruckQuery(next);
                                                                setValue("truckId", "");
                                                            }}
                                                            placeholder={t.placeholders.truckSearch}
                                                            className={`mb-2 border py-0 h-11 ${mmLeading} border-slate-100 bg-slate-50`}
                                                        />
                                                        {trucks.slice(0, 5).map((truck) => (
                                                            <Pressable
                                                                key={truck.id}
                                                                onPress={() => {
                                                                    setValue("truckId", truck.id, {
                                                                        shouldDirty: true,
                                                                        shouldValidate: true,
                                                                    });
                                                                    setTruckQuery(truck.plateNo);
                                                                    setTruckPickerOpen(false);
                                                                }}
                                                                className="py-2"
                                                            >
                                                                <Text
                                                                    className={`text-sm font-semibold text-slate-900 ${mmLeading}`}
                                                                >
                                                                    {truck.plateNo}
                                                                </Text>
                                                                <Text
                                                                    className={`mt-0.5 text-xs text-slate-500 ${mmLeading}`}
                                                                >
                                                                    {getTruckSubtitle(truck)}
                                                                </Text>
                                                            </Pressable>
                                                        ))}
                                                    </View>
                                                ) : null}
                                            </View>
                                        )}
                                    />

                                    {/* amount input field */}
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
                                    />

                                    {/* service type select box */}
                                    <Controller
                                        control={control}
                                        name="serviceType"
                                        render={({field: {value, onChange}}) => (
                                            <View className="gap-2">
                                                <RequiredLabel label={t.labels.serviceType} mmLeading={mmLeading}/>
                                                <Select
                                                    value={getSelectedServiceType(value, serviceTypes, locale)}
                                                    onValueChange={(next) => {
                                                        if (next && !Array.isArray(next)) {
                                                            onChange(next.value);
                                                        }
                                                    }}
                                                >
                                                    <Select.Trigger className=" py-0 h-11 ">
                                                        <Select.Value
                                                            placeholder={t.placeholders.serviceType}
                                                            style={compactLineInputTextStyle(locale)}
                                                        />
                                                        <Select.TriggerIndicator/>
                                                    </Select.Trigger>
                                                    <Select.Portal>
                                                        <Select.Overlay/>
                                                        <Select.Content
                                                            className="rounded-2xl text-xs border border-slate-200 bg-white"
                                                            presentation="popover"
                                                            width="trigger"
                                                        >
                                                            {serviceTypes.map((serviceType) => (
                                                                <Select.Item
                                                                    className=" text-xs!"
                                                                    key={String(serviceType.id)}
                                                                    value={serviceType.serviceType}
                                                                    label={getServiceTypeLabel(serviceType, locale)}
                                                                >
                                                                    <Select.ItemLabel className={mmLeading}/>
                                                                    <Select.ItemIndicator/>
                                                                </Select.Item>
                                                            ))}
                                                        </Select.Content>
                                                    </Select.Portal>
                                                </Select>
                                                {!!errors.serviceType?.message && (
                                                    <Text className={`text-xs text-red-500 ${mmLeading}`}>
                                                        {String(errors.serviceType.message)}
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
                                    />

                                    {/* service date */}
                                    <Controller
                                        control={control}
                                        name="serviceDate"
                                        render={({field: {value, onChange}}) => (
                                            <View className="gap-2">
                                                <RequiredLabel label={t.labels.serviceDate} mmLeading={mmLeading}/>
                                                <ServiceDatePicker
                                                    locale={locale}
                                                    value={value}
                                                    onChange={onChange}
                                                    placeholder={t.placeholders.serviceDate}
                                                    doneLabel={locale === "mm" ? "ရွေးချယ်မည်" : "Done"}
                                                />
                                                {!!errors.serviceDate?.message && (
                                                    <Text className={`text-xs text-red-500 ${mmLeading}`}>
                                                        {String(errors.serviceDate.message)}
                                                    </Text>
                                                )}
                                            </View>
                                        )}
                                    />

                                    {/* description textarea */}
                                    <Controller
                                        control={control}
                                        name="description"
                                        render={({field: {value, onChange}}) => (
                                            <View className="gap-2">
                                                <Text
                                                    className={`text-sm font-medium text-slate-900 ${mmLeading}`}
                                                >
                                                    {t.labels.description}
                                                </Text>
                                                <TextInput
                                                    value={value}
                                                    onChangeText={onChange}
                                                    placeholder={t.placeholders.description}
                                                    multiline
                                                    textAlignVertical="top"
                                                    className="min-h-[126px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                                                    style={compactMultilineInputTextStyle(locale)}
                                                />
                                            </View>
                                        )}
                                    />

                                    {/* step1 back && submit buttons */}
                                    <View className="flex-row gap-3 pt-2">
                                        <Pressable
                                            onPress={onBack}
                                            disabled={isPending}
                                            className="flex-1 items-center justify-center rounded-xl bg-slate-100 h-14 "
                                        >
                                            <Text className={`font-semibold text-slate-700 ${mmLeading}`}>
                                                {t.actions.cancel}
                                            </Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={handleSubmit(onSubmit)}
                                            disabled={isPending}
                                            className="flex-1 items-center justify-center rounded-xl h-14"
                                            style={{
                                                backgroundColor: APP_COLORS.primary,
                                                opacity: isPending ? 0.7 : 1,
                                            }}
                                        >
                                            <Text className={`font-semibold text-white ${mmLeading}`}>
                                                {t.actions.next}
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>
                            )
                    }
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

type RequiredLabelProps = {
    label: string;
    mmLeading: string;
};

type PreviewRowProps = {
    label: string;
    value: string;
    mmLeading: string;
    last?: boolean;
};

function PreviewRow({label, value, mmLeading, last}: PreviewRowProps) {
    return (
        <View className={`${last ? "" : "mb-3"}`}>
            <Text className={`text-xs text-slate-500 ${mmLeading}`}>{label}</Text>
            <Text className={`mt-1 text-sm font-semibold text-slate-900 ${mmLeading}`}>
                {value || "-"}
            </Text>
        </View>
    );
}

function RequiredLabel({label, mmLeading}: RequiredLabelProps) {
    return (
        <View className="flex-row items-center gap-1">
            <Text className={`text-sm font-medium text-slate-900 ${mmLeading}`}>
                {label}
            </Text>
            <Text className="text-red-500">*</Text>
        </View>
    );
}

type FormInputProps = {
    control: ReturnType<typeof useForm<FormValues>>["control"];
    name: keyof FormValues;
    label: string;
    placeholder: string;
    locale: AppLocale;
    keyboardType?: "decimal-pad";
    required?: boolean;
    error?: string;
    mmLeading: string;
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
                   }: FormInputProps) {
    return (
        <Controller
            control={control}
            name={name}
            render={({field: {value, onChange}}) => (
                <View className="gap-2">
                    {required ? (
                        <RequiredLabel label={label} mmLeading={mmLeading}/>
                    ) : (
                        <Text className={`text-sm font-medium text-slate-900 ${mmLeading}`}>
                            {label}
                        </Text>
                    )}
                    <Input
                        value={String(value ?? "")}
                        onChangeText={onChange}
                        placeholder={placeholder}
                        keyboardType={keyboardType}
                        className={`border py-0 h-11 ${getMyanmarLeadingClass(locale)}  border-slate-200 bg-white`}
                    />
                    {!!error && (
                        <Text className={`text-xs text-red-500 ${mmLeading}`}>
                            {String(error)}
                        </Text>
                    )}
                </View>
            )}
        />
    );
}

function getServiceTypeLabel(item: ServiceTypeItem, locale: "en" | "mm") {
    return locale === "mm" ? item.langMy || item.langEng : item.langEng;
}

function getSelectedServiceType(
    value: string,
    options: ServiceTypeItem[],
    locale: "en" | "mm",
) {
    const option = options.find((item) => item.serviceType === value);
    if (!option) return undefined;
    return {
        value: option.serviceType,
        label: getServiceTypeLabel(option, locale),
    };
}
