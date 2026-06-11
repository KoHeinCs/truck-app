import { APP_COLORS } from "@/constants/colors";
import {
  getMyanmarLeadingClass,
  myanmarUITextStyle,
} from "@/constants/myanmar-font";
import { useTranslation } from "@/hooks/use-translation";
import { getApiErrorAlertCopy } from "@/lib/api-error-alert";
import { useAuthStore } from "@/stores/auth-store";
import { useLocaleStore } from "@/stores/client/locale-store";
import { useOwnerLookupOptions } from "@/stores/server/ownership/owner-lookup-query";
import { usePurchaseOwnership } from "@/stores/server/ownership/purchase-mutation";
import { useTruckByPlateNo } from "@/stores/server/truck/query";
import Ionicons from "@expo/vector-icons/Ionicons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { Button, Input, Select } from "heroui-native";
import React, { useCallback, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { z } from "zod";

const YEAR_RE = /^\d{4}$/;
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
            locale === "mm" ? "ပိုင်ရှင်ကို ရွေးချယ်ပေးပါ" : "Please select an owner",
          )
      : z.string().optional().or(z.literal("")),
    plateNo: z
      .string()
      .min(
        1,
        locale === "mm" ? "ယာဉ်နံပါတ် လိုအပ်သည်" : "Plate number is required",
      )
      .max(
        50,
        locale === "mm"
          ? "ယာဉ်နံပါတ်သည် စာလုံး 50 ထက်မကျော်ရပါ"
          : "Plate number cannot exceed 50 characters",
      )
      .regex(
        /^[0-9A-Z]{2}-[0-9]{4}$/,
        locale === "mm"
          ? "ယာဉ်နံပါတ် ဖော်မတ်မမှန်ပါ။ (ဥပမာ - 3R-9999)"
          : "Invalid plate number format. (e.g., 3R-9999)",
      ),
    model: z
      .string()
      .min(1, locale === "mm" ? "အမျိုးအစား လိုအပ်သည်" : "Type is required")
      .max(
        100,
        locale === "mm"
          ? "အမျိုးအစားသည် စာလုံး 100 ထက်မကျော်ရပါ"
          : "Type cannot exceed 100 characters",
      ),
    modelYear: z
      .string()
      .min(1, locale === "mm" ? "လုပ်နှစ် လိုအပ်သည်" : "Year is required")
      .refine((v) => YEAR_RE.test(v.trim()), {
        message:
          locale === "mm" ? "4 လုံးပါ နှစ်ကိုထည့်ပါ" : "Enter a valid 4-digit year",
      }),
    fuelType: z
      .string()
      .min(1, locale === "mm" ? "လောင်စာအမျိုးအစား ရွေးပါ" : "Fuel type is required")
      .refine((val) => FUEL_TYPES.includes(val as (typeof FUEL_TYPES)[number]), {
        message:
          locale === "mm" ? "လောင်စာအမျိုးအစား ရွေးပါ" : "Fuel type is required",
      }),
    frontTire: z
      .string()
      .min(
        1,
        locale === "mm" ? "ရှေ့တာယာ လိုအပ်သည်" : "Front tire size is required",
      )
      .max(
        100,
        locale === "mm"
          ? "ရှေ့တာယာသည် စာလုံး 100 ထက်မကျော်ရပါ"
          : "Front tire size cannot exceed 100 characters",
      ),
    backTire: z
      .string()
      .min(
        1,
        locale === "mm" ? "နောက်တာယာ လိုအပ်သည်" : "Rear tire size is required",
      )
      .max(
        100,
        locale === "mm"
          ? "နောက်တာယာသည် စာလုံး 100 ထက်မကျော်ရပါ"
          : "Rear tire size cannot exceed 100 characters",
      ),
    chassisNo: z
      .string()
      .max(
        100,
        locale === "mm"
          ? "ကိုယ်ထည်အမှတ်သည် စာလုံး 100 ထက်မကျော်ရပါ"
          : "Chassis number cannot exceed 100 characters",
      )
      .optional()
      .or(z.literal("").or(z.null())),
    engineNo: z
      .string()
      .max(
        100,
        locale === "mm"
          ? "အင်ဂျင်အမှတ်သည် စာလုံး 100 ထက်မကျော်ရပါ"
          : "Engine number cannot exceed 100 characters",
      )
      .optional()
      .or(z.literal("").or(z.null())),
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

function normalizeFuelType(value: unknown): string {
  const raw = String(value ?? "").trim().toUpperCase();
  if (FUEL_TYPES.includes(raw as (typeof FUEL_TYPES)[number])) {
    return raw;
  }
  return "DIESEL";
}

export default function OwnershipCreateScreen() {
  const router = useRouter();
  const qc = useQueryClient();
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
  const canSubmit = upperRole === "ADMIN" || upperRole === "OWNER";

  const { createOwnership: t } = useTranslation("ownership");
  const { fuelTypes } = useTranslation("lookup");
  const errorCatalog = useTranslation("error");
  const { mutate, isPending } = usePurchaseOwnership();
  const { data: ownerOptions = [] } = useOwnerLookupOptions("");
  const { data: truck } = useTruckByPlateNo(plateNoParam, isSearchMode);

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
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ownerId: "",
      plateNo: "",
      model: "",
      modelYear: "",
      fuelType: "DIESEL",
      frontTire: "",
      backTire: "",
      chassisNo: "",
      engineNo: "",
    },
  });

  useEffect(() => {
    if (!isSearchMode || !truck) return;

    reset({
      ownerId: "",
      plateNo: String(truck.plateNo ?? plateNoParam).trim().toUpperCase(),
      model: String(truck.model ?? "").trim(),
      modelYear: String(truck.modelYear ?? "").trim(),
      fuelType: normalizeFuelType(truck.fuelType),
      frontTire: "",
      backTire: "",
      chassisNo: "",
      engineNo: "",
    });
  }, [isSearchMode, truck, plateNoParam, reset]);

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
    if (!canSubmit) {
      Alert.alert(t.unauthorizedTitle, t.unauthorizedBody);
      return;
    }

    const ownerId = showOwnerId ? values.ownerId?.trim() : userId?.trim();
    if (!ownerId) {
      Alert.alert(
        t.errorTitle,
        showOwnerId ? t.ownerRequired : t.unauthorizedBody,
      );
      return;
    }

    mutate(
      {
        ownerId,
        plateNo: values.plateNo.trim(),
        model: values.model.trim(),
        modelYear: Number(values.modelYear),
        fuelType: values.fuelType.trim(),
        frontTire: values.frontTire.trim(),
        backTire: values.backTire.trim(),
        chassisNo: values.chassisNo?.trim() || undefined,
        engineNo: values.engineNo?.trim() || undefined,
      },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: ["ownership"] });
          Alert.alert(t.successTitle, t.successBody);
          router.replace("/(tabs)/ownership" as Href);
        },
        onError: (err: unknown) => {
          const { title, message } = getApiErrorAlertCopy(err, errorCatalog, {
            title: t.errorTitle,
            message: t.errorBody,
          });
          Alert.alert(title, message);
        },
      },
    );
  };

  const renderTextInput = (
    key: keyof Omit<FormValues, "fuelType" | "ownerId">,
    options?: { required?: boolean; keyboardType?: "number-pad" },
  ) => (
    <View className="gap-1.5">
      <View className="flex-row items-center gap-1">
        <Text
          className={`text-sm font-medium ${mmLeading}`}
          style={[{ color: APP_COLORS.textSecondary }, style]}
        >
          {t.labels[key]}
          {options?.required ? (
            <Text style={{ color: APP_COLORS.error }}> *</Text>
          ) : null}
        </Text>
        {options?.required ? null : (
          <Text
            className={`text-[11px] font-medium ${mmLeading}`}
            style={{ color: APP_COLORS.warning }}
          >
            {locale === "mm" ? "(မထည့်လည်းရ)" : "(Optional)"}
          </Text>
        )}
      </View>
      <Controller
        control={control}
        name={key}
        render={({ field: { onChange, value } }) => (
          <Input
            value={String(value ?? "")}
            onChangeText={onChange}
            keyboardType={options?.keyboardType}
            placeholder={t.placeholders[key]}
            placeholderTextColor={APP_COLORS.textMuted}
            autoCapitalize="none"
            style={[
              {
                backgroundColor: APP_COLORS.inputBackground,
                borderColor: errors[key] ? APP_COLORS.error : APP_COLORS.border,
                borderWidth: 1,
                color: APP_COLORS.textPrimary,
              },
              style,
            ]}
            className={`h-12 py-0 text-sm font-medium ${mmLeading}`}
          />
        )}
      />
      {!!errors[key]?.message && (
        <Text
          className={`text-xs font-normal ${mmLeading}`}
          style={[{ color: APP_COLORS.error }, style]}
        >
          {String(errors[key]?.message)}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: APP_COLORS.background }}
    >
      <View className="flex-row items-center px-4 pb-3 pt-1">
        <Pressable
          onPress={onBack}
          className="h-11 w-11 items-center justify-center rounded-full"
          style={({ pressed }) => ({
            backgroundColor: pressed ? APP_COLORS.primary : APP_COLORS.background,
          })}
        >
          <Ionicons name="arrow-back" size={22} color="#475569" />
        </Pressable>
        <Text
          className={`flex-1 px-3 text-center text-lg font-bold ${mmLeading}`}
          style={[style, { color: APP_COLORS.textPrimary }]}
        >
          {t.title}
        </Text>
        <View className="h-11 w-11" />
      </View>

      <ScrollView
        className="px-4"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 80,
          flexGrow: 1,
        }}
      >
        <View className="mt-1 gap-4">
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
                  style={[{ color: APP_COLORS.textSecondary }, style]}
                >
                  {t.labels.ownerId}
                  <Text style={{ color: APP_COLORS.error }}> *</Text>
                </Text>
                <Controller
                  control={control}
                  name="ownerId"
                  render={({ field: { value, onChange } }) => {
                    const selectedOption = ownerSelectOptions.find(
                      (opt) => opt.value === value,
                    );
                    const selectedLabel = selectedOption?.label ?? "";

                    return (
                      <Select
                        value={
                          value
                            ? { value, label: selectedLabel }
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
                            className={`py-0 text-sm font-medium ${mmLeading}`}
                            style={{ color: APP_COLORS.textPrimary }}
                          />
                          <Select.TriggerIndicator />
                        </Select.Trigger>
                        <Select.Portal>
                          <Select.Overlay />
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
                                    className={`text-xs ${mmLeading}`}
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
                                  <Select.ItemIndicator />
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
                    style={[{ color: APP_COLORS.error }, style]}
                  >
                    {String(errors.ownerId.message)}
                  </Text>
                )}
              </View>
            </View>
          ) : null}

          <View
            className="rounded-2xl p-4"
            style={{
              backgroundColor: APP_COLORS.card,
              borderColor: APP_COLORS.border,
              borderWidth: 1,
            }}
          >
            <View className="gap-3">
              <Text
                className={`text-sm font-bold ${mmLeading}`}
                style={[style, { color: APP_COLORS.textPrimary }]}
              >
                {t.basicInfoTitle}
              </Text>

              {renderTextInput("plateNo", { required: true })}

              <View className="flex-row gap-2">
                <View className="flex-1">
                  {renderTextInput("model", { required: true })}
                </View>
                <View className="flex-1">
                  {renderTextInput("modelYear", {
                    required: true,
                    keyboardType: "number-pad",
                  })}
                </View>
              </View>

              <View className="gap-1.5">
                <Text
                  className={`text-sm font-medium ${mmLeading}`}
                  style={[{ color: APP_COLORS.textSecondary }, style]}
                >
                  {t.labels.fuelType}
                  <Text style={{ color: APP_COLORS.error }}> *</Text>
                </Text>
                <Controller
                  control={control}
                  name="fuelType"
                  render={({ field: { value, onChange } }) => {
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
                            borderColor: errors.fuelType
                              ? APP_COLORS.error
                              : APP_COLORS.border,
                            borderWidth: 1,
                          }}
                        >
                          <Select.Value
                            placeholder={t.placeholders.fuelType}
                            className={`py-0 text-sm font-medium ${mmLeading}`}
                            style={{ color: APP_COLORS.textPrimary }}
                          />
                          <Select.TriggerIndicator />
                        </Select.Trigger>
                        <Select.Portal>
                          <Select.Overlay />
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
                                    backgroundColor: isSelected
                                      ? APP_COLORS.primarySoft
                                      : "transparent",
                                    paddingVertical: 12,
                                    paddingHorizontal: 16,
                                  }}
                                >
                                  <Select.ItemLabel
                                    className={`text-xs ${mmLeading}`}
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
                                  <Select.ItemIndicator />
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
                    style={[{ color: APP_COLORS.error }, style]}
                  >
                    {String(errors.fuelType.message)}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View
            className="rounded-2xl p-4"
            style={{
              backgroundColor: APP_COLORS.card,
              borderColor: APP_COLORS.border,
              borderWidth: 1,
            }}
          >
            <View className="gap-3">
              <Text
                className={`text-sm font-bold ${mmLeading}`}
                style={[style, { color: APP_COLORS.textPrimary }]}
              >
                {t.tireAndExtraTitle}
              </Text>

              <View className="flex-row gap-2">
                <View className="flex-1">
                  {renderTextInput("frontTire", { required: true })}
                </View>
                <View className="flex-1">
                  {renderTextInput("backTire", { required: true })}
                </View>
              </View>

              {renderTextInput("chassisNo")}
              {renderTextInput("engineNo")}
            </View>
          </View>
        </View>

        <Button
          onPress={handleSubmit(onSubmit)}
          isDisabled={isPending || !canSubmit}
          className={`mb-2 mt-5 items-center justify-center rounded-xl ${mmLeading}`}
          style={{ backgroundColor: APP_COLORS.primary }}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            <Text
              className={`text-sm font-bold text-white ${mmLeading}`}
              style={style}
            >
              {isPending ? t.submitting : t.submit}
            </Text>
          </View>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
