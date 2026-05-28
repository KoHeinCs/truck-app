import {
  getMyanmarLeadingClass,
  myanmarUITextStyle,
} from "@/constants/myanmar-font";
import { useTranslation } from "@/hooks/use-translation";
import { getApiErrorAlertCopy } from "@/lib/api-error-alert";
import profileLocale from "@/locale/profile/profile.json";
import { useLocaleStore } from "@/stores/client/locale-store";
import { useCreateTruck } from "@/stores/server/truck/create-mutation";
import Ionicons from "@expo/vector-icons/Ionicons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Button, Input, Select } from "heroui-native";
import React, { useCallback, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { z } from "zod";
import {APP_COLORS} from "@/constants/colors";

const YEAR_RE = /^\d{4}$/;
const FUEL_TYPES = ["diesel", "petrol", "CNG"] as const;

function buildSchema(requiredField: string, modelYearInvalid: string) {
  return z.object({
    plateNo: z.string().min(1, requiredField).max(50),
    model: z.string().min(1, requiredField).max(50),
    modelYear: z
      .string()
      .min(1, requiredField)
      .refine((v) => YEAR_RE.test(v.trim()), modelYearInvalid),
    fuelType: z.enum(FUEL_TYPES, { message: requiredField }),
    frontTire: z.string().min(1, requiredField).max(100),
    backTire: z.string().min(1, requiredField).max(100),
    chassisNo: z.string().max(100).optional(),
    engineNo: z.string().max(100).optional(),
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export default function CreateTruckScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const insets = useSafeAreaInsets();
  const locale = useLocaleStore((state) => state.locale);
  const labels = profileLocale[locale].createTruckScreen;
  const errorCatalog = useTranslation("error");
  const { mutate, isPending } = useCreateTruck();

  const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
  const style = locale === "mm" ? mmTextStyle : undefined;

  const schema = useMemo(
    () => buildSchema(labels.requiredField, labels.modelYearInvalid),
    [labels.modelYearInvalid, labels.requiredField],
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      plateNo: "",
      model: "",
      modelYear: "",
      fuelType: "diesel",
      frontTire: "",
      backTire: "",
      chassisNo: "",
      engineNo: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    mutate(
      {
        plateNo: values.plateNo.trim(),
        model: values.model.trim(),
        modelYear: Number(values.modelYear.trim()),
        fuelType: values.fuelType.trim(),
        frontTire: values.frontTire.trim(),
        backTire: values.backTire.trim(),
        chassisNo: values.chassisNo?.trim() || undefined,
        engineNo: values.engineNo?.trim() || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert(labels.successTitle, labels.successBody);
          router.back();
        },
        onError: (err: unknown) => {
          const { title, message } = getApiErrorAlertCopy(err, errorCatalog, {
            title: labels.errorTitle,
            message: labels.errorBody,
          });
          Alert.alert(title, message);
        },
      },
    );
  };

  const onBack = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["trucks"] });
    router.back();
  }, [qc, router]);

  const renderTextInput = (
    key: keyof Omit<FormValues, "fuelType">,
    options?: { required?: boolean; keyboardType?: "number-pad" },
  ) => (
    <View className="gap-1.5">
      <View className="flex-row items-center gap-1">
        <Text
          className={`text-sm font-medium  ${getMyanmarLeadingClass(locale)} `}
          style={[{color: APP_COLORS.textSecondary}, style]}
        >
          {labels.fieldLabels[key]}
        </Text>
        {options?.required ? null : (
            <Text
                className={`text-[11px] font-medium ${getMyanmarLeadingClass(locale)}`}
                style={{color: APP_COLORS.warning}}>{locale === 'mm' ? '(မထည့်လည်းရ)' : '(Optional)'}
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
            placeholderTextColor={APP_COLORS.textMuted}
            autoCapitalize="none"
            style={[{
              backgroundColor: APP_COLORS.inputBackground,
              borderColor: errors[key] ? APP_COLORS.error : APP_COLORS.border,
              borderWidth: 1,
              color: APP_COLORS.textPrimary
            }, style]}
            className={`py-0 h-12 text-sm font-medium ${getMyanmarLeadingClass(locale)}`}
          />
        )}
      />
      {!!errors[key]?.message && (
          <Text className={`text-xs font-normal ${getMyanmarLeadingClass(locale)} `}
                style={[{color: APP_COLORS.error}, style]}>
          {String(errors[key]?.message)}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{backgroundColor:APP_COLORS.background}}>
      <View className="flex-row items-center px-4 pb-3 pt-1">
        <Pressable
          onPress={onBack}
          className="h-11 w-11 items-center justify-center rounded-full"
          style={({pressed}) => ({
            backgroundColor: pressed ? APP_COLORS.primary : APP_COLORS.background
          })}
        >
          <Ionicons name="arrow-back" size={22} color="#475569" />
        </Pressable>
        <Text
          className={`flex-1 px-3 text-center text-lg ${getMyanmarLeadingClass(locale)}  font-bold `}
          style={[style, {color: APP_COLORS.textPrimary}]}
        >
          {labels.title}
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

          {/* 1st card */}
          <View className="rounded-2xl p-4"
                style={{
                  backgroundColor: APP_COLORS.card,
                  borderColor: APP_COLORS.border,
                  borderWidth: 1
                }}>

            <View className="gap-3">

              <Text
                className={`text-sm font-bold  ${getMyanmarLeadingClass(locale)}`}
                style={[style,{color:APP_COLORS.textPrimary}]}
              >
                {labels.basicInfoTitle}
              </Text>

              {/* plate number section */}
              {renderTextInput("plateNo", { required: true })}

              {/* model && model year section */}
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

              {/* fuel type */}
              <View className="gap-1.5">

                <View className="flex-row items-center gap-1">
                  <Text
                      className={`text-sm font-medium ${getMyanmarLeadingClass(locale)}`}
                      style={[{color: APP_COLORS.textSecondary}, style]}
                  >
                    {labels.fieldLabels.fuelType}
                  </Text>
                </View>

                <Controller
                  control={control}
                  name="fuelType"
                  render={({ field: { value, onChange } }) => (
                    <Select
                      value={{ value, label: value }}
                      onValueChange={(next) => {
                        if (next && !Array.isArray(next)) {
                          onChange(next.value as FormValues["fuelType"]);
                        }
                      }}
                    >
                      <Select.Trigger
                          className={`rounded-xl h-14 py-0 ${getMyanmarLeadingClass(locale)}   px-2.5`}
                          style={{
                            backgroundColor: APP_COLORS.inputBackground,
                            borderColor: APP_COLORS.border,
                            borderWidth: 1
                          }}
                      >
                        <Select.Value
                          placeholder={labels.fuelTypePlaceholder}
                          className={` py-0 text-sm font-medium ${getMyanmarLeadingClass(locale)}`}
                          style={[{color: APP_COLORS.textPrimary}]}
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
                              borderWidth: 1
                          }}
                          presentation="popover"
                          width="trigger"
                        >
                          {FUEL_TYPES.map((fuelType) => {

                          const itemLabel = fuelType;
                          const isSelected = fuelType === value;

                          return (
                            <Select.Item
                              key={fuelType}
                              value={fuelType}
                              label={itemLabel}
                              style={{
                                  backgroundColor: isSelected ? APP_COLORS.primarySoft : 'transparent',
                                  paddingVertical: 12,
                                  paddingHorizontal: 16,
                              }}
                            >
                                <Select.ItemLabel
                                    className={`text-xs ${getMyanmarLeadingClass(locale)}`}
                                    style={[style, {
                                        color: isSelected ? APP_COLORS.primary : APP_COLORS.textPrimary,
                                        fontWeight: isSelected ? "600" : "400"
                                    }]}
                                />
                              <Select.ItemIndicator />
                            </Select.Item>
                          )}

                          )}
                        </Select.Content>
                      </Select.Portal>
                    </Select>
                  )}
                />
                {!!errors.fuelType?.message && (
                    <Text className={`text-xs font-normal ${getMyanmarLeadingClass(locale)} `}
                          style={[{color: APP_COLORS.error}, style]}>
                    {String(errors.fuelType.message)}
                  </Text>
                )}
              </View>

            </View>

          </View>

          {/* 2nd card */}
          <View className="rounded-2xl p-4"
                style={{
                  backgroundColor: APP_COLORS.card,
                  borderColor: APP_COLORS.border,
                  borderWidth: 1
                }}>
            <View className="gap-3">
              <Text
                  className={`text-sm font-bold  ${getMyanmarLeadingClass(locale)}`}
                  style={[style,{color:APP_COLORS.textPrimary}]}
              >
                {labels.tireAndExtraTitle}
              </Text>

              {/* fTire and bTire section */}
              <View className="flex-row gap-2">
                <View className="flex-1">
                  {renderTextInput("frontTire", { required: true })}
                </View>
                <View className="flex-1">
                  {renderTextInput("backTire", { required: true })}
                </View>
              </View>

              {/* chassisNo section */}
              {renderTextInput("chassisNo")}

              {/* engineNo section */}
              {renderTextInput("engineNo")}

            </View>
          </View>

        </View>

        <Button
          onPress={handleSubmit(onSubmit)}
          isDisabled={isPending}
          className={`mb-2 mt-5 items-center justify-center rounded-xl ${getMyanmarLeadingClass(locale)} bg-primary `}
          variant="outline"
        >
          <Text className={`text-sm font-bold text-white ${getMyanmarLeadingClass(locale)}`} style={style}>
            {isPending ? labels.submitting : labels.submit}
          </Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
