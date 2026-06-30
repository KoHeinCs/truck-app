import {CompactTextInput} from "@/components/compact-text-input";
import {APP_COLORS} from "@/constants/colors";
import {COMPACT_ADVANCED_INPUT_CLASSNAME} from "@/constants/compact-input";
import type {AppLocale} from "@/stores/client/locale-store";
import type {OwnershipAdvancedFilters as OwnershipAdvancedFilterValues} from "@/stores/server/ownership/search-columns";
import {Card} from "heroui-native";
import React, {useMemo} from "react";
import type {StyleProp, TextStyle} from "react-native";
import {Pressable, Text, View} from "react-native";
import {CompactSelect} from "@/app/(tabs)/profile/user/components/compact-select";
import {useTranslation} from "@/hooks/use-translation";
import {AdvanceSearchDatePicker} from "@/components/advance-search-date-picker";


type OwnershipAdvancedFiltersProps = {
    filters: OwnershipAdvancedFilterValues;
    locale: AppLocale;
    style?: StyleProp<TextStyle>;
    showOwnerId: boolean;
    onChange: (next: Partial<OwnershipAdvancedFilterValues>) => void;
    onReset: () => void;
    onApply: () => void;
    mmLeading: any;
    ownerOptions: any;
    status: string;
};

export function OwnershipAdvancedFilters({
                                             filters,
                                             locale,
                                             style,
                                             showOwnerId,
                                             onChange,
                                             onReset,
                                             onApply,
                                             mmLeading,
                                             ownerOptions,
                                             status
                                         }: OwnershipAdvancedFiltersProps) {


    const tCommon = useTranslation("common");
    const {search: t} = useTranslation('ownership')
    const ownerSelectOptions = useMemo(
        () => [{value: "", label: tCommon.anyLabel}, ...ownerOptions],
        [ownerOptions, tCommon.anyLabel]
    );

    return (
        <Card className="mb-4 p-5"
              style={{
                  backgroundColor: APP_COLORS.card,
                  borderColor: APP_COLORS.border,
                  borderWidth: 1
              }}
        >
            <Card.Body className="gap-3">
                {/* title */}
                <Text
                    className={`text-sm font-medium  ${mmLeading}`}
                    style={[{color: APP_COLORS.textPrimary}, style]}
                >
                    {t.advancedTitle}
                </Text>

                {/* plate number , licence city */}
                <View className="flex-row gap-2">
                    <FilterInput
                        label={t.labels.plateNo}
                        value={filters.plateNo}
                        placeholder={t.placeholders.plateNo}
                        locale={locale}
                        style={style}
                        onChangeText={(plateNo) => onChange({plateNo})}
                        mmLeading={mmLeading}
                    />
                    <FilterInput
                        label={t.labels.licenseCity}
                        value={filters.licenseCity}
                        placeholder={t.placeholders.licenseCity}
                        locale={locale}
                        style={style}
                        onChangeText={(licenseCity) => onChange({licenseCity})}
                        mmLeading={mmLeading}
                    />
                </View>

                <View className="flex-row gap-2">
                    <FilterDateField
                        label={t.labels.licenseEndDate}
                        value={filters.licenseEndDate}
                        placeholder={t.placeholders.licenseEndDate}
                        locale={locale}
                        mmLeading={mmLeading}
                        doneLabel={locale === "mm" ? "ရွေးချယ်မည်" : "Done"}
                        mode="date"
                        onChange={(licenseEndDate) => onChange({licenseEndDate})}
                        style={style}
                    />
                    {status === 'SOLD_OUT' && (
                        <FilterInput
                            label={t.labels.profit}
                            value={filters.profit}
                            placeholder={t.placeholders.profit}
                            keyboardType="number-pad"
                            locale={locale}
                            style={style}
                            onChangeText={(profit) => onChange({profit})}
                            mmLeading={mmLeading}
                        />
                    )}

                </View>

                {showOwnerId ? (
                    <CompactSelect
                        label={t.labels.ownerIdCsv}
                        value={filters.ownerIdCsv}
                        onChange={(ownerIdCsv) => onChange({ownerIdCsv})}
                        locale={locale}
                        placeholder={t.placeholders.ownerIdCsv}
                        options={ownerSelectOptions}
                    />
                ) : null}

                {/* reset , search buttons */}
                <View className="flex-row gap-2 pt-0.5">
                    <Pressable
                        onPress={onReset}
                        className="flex-1 py-3 items-center justify-center rounded-xl  "
                        style={({pressed}) => ({
                            backgroundColor: pressed ? APP_COLORS.errorSoft : 'transparent',
                            borderColor: APP_COLORS.border,
                            borderWidth: 1
                        })}
                    >
                        <Text
                            className={`text-xs font-semibold  ${mmLeading}`}
                            style={{color: APP_COLORS.error}}
                        >
                            {t.actions.reset}
                        </Text>
                    </Pressable>

                    <Pressable
                        className="flex-1 py-3 items-center justify-center rounded-xl "
                        style={({pressed}) => ({
                            backgroundColor: pressed ? APP_COLORS.primaryPressed : APP_COLORS.primary
                        })}
                        onPress={onApply}
                    >
                        <Text className={`text-xs font-semibold text-white ${mmLeading}`}>
                            {t.actions.search}
                        </Text>
                    </Pressable>
                </View>
            </Card.Body>
        </Card>
    );
}

type FilterInputProps = {
    label: string;
    value: string;
    placeholder: string;
    keyboardType?: "default" | "number-pad";
    locale: AppLocale;
    style?: StyleProp<TextStyle>;
    onChangeText: (next: string) => void;
    mmLeading: any;
};

function FilterInput({
                         label,
                         value,
                         placeholder,
                         keyboardType = "default",
                         locale,
                         style,
                         onChangeText,
                         mmLeading
                     }: FilterInputProps) {
    return (
        <View className="flex-1 gap-1">
            <Text
                className={`text-sm font-medium ${mmLeading}`}
                style={[{color: APP_COLORS.textMuted}, style]}
            >
                {label}
            </Text>
            <CompactTextInput
                locale={locale}
                compactVariant="advanced"
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                keyboardType={keyboardType}
                className={`${mmLeading} ${COMPACT_ADVANCED_INPUT_CLASSNAME}`}
                style={style}
            />
        </View>
    );
}


type FilterDateFieldProps = {
    label: string;
    value: string;
    placeholder: string;
    locale: AppLocale;
    mmLeading: string;
    doneLabel: string;
    mode?: "date" | "datetime";
    onChange: (next: string) => void;
    style: any;
};

function FilterDateField({
                             label,
                             value,
                             placeholder,
                             locale,
                             mmLeading,
                             doneLabel,
                             mode = "datetime",
                             onChange,
                             style
                         }: FilterDateFieldProps) {
    return (
        <View className="flex-1 gap-1">
            <Text
                className={`text-sm font-medium ${mmLeading}`}
                style={[{color: APP_COLORS.textMuted}, style]}
            >
                {label}
            </Text>
            <AdvanceSearchDatePicker
                locale={locale}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                doneLabel={doneLabel}
                mode={mode}
                triggerClassName="h-11 min-h-11"
                style={style}
            />
        </View>
    );
}
