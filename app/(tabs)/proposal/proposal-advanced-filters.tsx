import {CompactTextInput} from "@/components/compact-text-input";
import {ServiceDatePicker} from "@/components/service-date-picker";
import {APP_COLORS} from "@/constants/colors";
import {COMPACT_ADVANCED_INPUT_CLASSNAME} from "@/constants/compact-input";
import {getMyanmarLeadingClass} from "@/constants/myanmar-font";
import {useTranslation} from "@/hooks/use-translation";
import type {AppLocale} from "@/stores/client/locale-store";
import {useOwnerLookupOptions} from "@/stores/server/ownership/owner-lookup-query";
import type {ProposalAdvancedFilters as ProposalAdvancedFilterValues} from "@/stores/server/proposal/search-columns";
import {useServiceTypesInfinite} from "@/stores/server/service-type/query";
import {buildServiceTypeSearchColumns} from "@/stores/server/service-type/search-columns";
import type {ServiceTypeItem} from "@/stores/server/service-type/typed";
import {Card} from "heroui-native";
import React, {useMemo} from "react";
import {Pressable, Text, View} from "react-native";
import {CompactSelect} from "../profile/user/components/compact-select";

type ProposalAdvancedFiltersProps = {
    filters: ProposalAdvancedFilterValues;
    locale: AppLocale;
    showOwnerId: boolean;
    showCreatedBy: boolean;
    onChange: (next: Partial<ProposalAdvancedFilterValues>) => void;
    onReset: () => void;
    onApply: () => void;
};

export function ProposalAdvancedFilters({
                                            filters,
                                            locale,
                                            showOwnerId,
                                            showCreatedBy,
                                            onChange,
                                            onReset,
                                            onApply,
                                        }: ProposalAdvancedFiltersProps) {

    const {search:t} = useTranslation('proposal')
    const tCommon = useTranslation("common");
    const mmLeading = getMyanmarLeadingClass(locale);

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
    const {data: ownerOptions = []} = useOwnerLookupOptions("");

    const serviceTypeOptions = useMemo(
        () => [
            {value: "", label: tCommon.anyLabel},
            ...serviceTypes.map((serviceType) => ({
                value: serviceType.serviceType,
                label: getServiceTypeLabel(serviceType, locale),
            })),
        ],
        [serviceTypes, locale, tCommon.anyLabel],
    );

    const ownerSelectOptions = useMemo(
        () => [{value: "", label: tCommon.anyLabel}, ...ownerOptions],
        [ownerOptions, tCommon.anyLabel],
    );

    return (
        <Card
            className="mb-4 p-5"
            style={{
                backgroundColor:APP_COLORS.card,
                borderColor:APP_COLORS.border,
                borderWidth:1
            }}
        >
            <Card.Body className="gap-3">
                {/* title */}
                <Text
                    className={`text-sm font-medium  ${mmLeading}`}
                    style={{color:APP_COLORS.textPrimary}}
                >
                    {t.advancedTitle}
                </Text>

                {/* proposal number , plate number */}
                <View className="flex-row gap-2">
                    <FilterInput
                        label={t.labels.proposalNo}
                        value={filters.proposalNo}
                        placeholder={t.placeholders.proposalNo}
                        locale={locale}
                        mmLeading={mmLeading}
                        onChangeText={(proposalNo) => onChange({proposalNo})}
                    />
                    <FilterInput
                        label={t.labels.plateNo}
                        value={filters.plateNo}
                        placeholder={t.placeholders.plateNo}
                        locale={locale}
                        mmLeading={mmLeading}
                        onChangeText={(plateNo) => onChange({plateNo})}
                    />
                </View>

                {/* proposal date [from-to] */}
                <View className="flex-row gap-2">
                    <FilterDateField
                        label={t.labels.proposalDateFrom}
                        value={filters.proposalDateFrom}
                        placeholder={t.placeholders.proposalDateFrom}
                        locale={locale}
                        mmLeading={mmLeading}
                        doneLabel= {locale === "mm" ? "ရွေးချယ်မည်" : "Done"}
                        mode="date"
                        onChange={(proposalDateFrom) => onChange({proposalDateFrom})}
                    />
                    <FilterDateField
                        label={t.labels.proposalDateTo}
                        value={filters.proposalDateTo}
                        placeholder={t.placeholders.proposalDateTo}
                        locale={locale}
                        mmLeading={mmLeading}
                        doneLabel= {locale === "mm" ? "ရွေးချယ်မည်" : "Done"}
                        mode="date"
                        onChange={(proposalDateTo) => onChange({proposalDateTo})}
                    />
                </View>

                {/* service date [from-to] */}
                <View className="flex-row gap-2">
                    <FilterDateField
                        label={t.labels.serviceDateFrom}
                        value={filters.serviceDateFrom}
                        placeholder={t.placeholders.serviceDateFrom}
                        locale={locale}
                        mmLeading={mmLeading}
                        doneLabel= {locale === "mm" ? "ရွေးချယ်မည်" : "Done"}
                        onChange={(serviceDateFrom) => onChange({serviceDateFrom})}
                    />
                    <FilterDateField
                        label={t.labels.serviceDateTo}
                        value={filters.serviceDateTo}
                        placeholder={t.placeholders.serviceDateTo}
                        locale={locale}
                        mmLeading={mmLeading}
                        doneLabel= {locale === "mm" ? "ရွေးချယ်မည်" : "Done"}
                        onChange={(serviceDateTo) => onChange({serviceDateTo})}
                    />
                </View>

                {/* service type , owner */}
                <View className="flex-row gap-2">
                    <CompactSelect
                        label={t.labels.serviceType}
                        value={filters.serviceTypeCsv}
                        onChange={(serviceTypeCsv) => onChange({serviceTypeCsv})}
                        locale={locale}
                        placeholder={t.placeholders.serviceType}
                        options={serviceTypeOptions}
                    />
                    {showOwnerId ? (
                        <CompactSelect
                            label={t.labels.ownerId}
                            value={filters.ownerId}
                            onChange={(ownerId) => onChange({ownerId})}
                            locale={locale}
                            placeholder={t.placeholders.ownerId}
                            options={ownerSelectOptions}
                        />
                    ) : (
                        <View className="flex-1"/>
                    )}
                </View>

                {/* created user */}
                {showCreatedBy ? (
                    <View className="gap-1">
                        <Text className={`text-[10px] text-slate-500 ${mmLeading}`}>
                            {t.labels.createdBy}
                        </Text>
                        <CompactTextInput
                            locale={locale}
                            compactVariant="advanced"
                            value={filters.createdByCsv}
                            onChangeText={(createdByCsv) => onChange({createdByCsv})}
                            placeholder={t.placeholders.createdBy}
                            className={`border border-slate-200 bg-white ${COMPACT_ADVANCED_INPUT_CLASSNAME}`}
                        />
                    </View>
                ) : null}

                {/* reset , search buttons */}
                <View className="flex-row gap-2 pt-0.5">
                    <Pressable
                        onPress={onReset}
                        className="flex-1 items-center justify-center rounded-xl  py-2"
                        style={({ pressed }) => ({
                            backgroundColor: pressed ? APP_COLORS.errorSoft : 'transparent',
                            borderColor: APP_COLORS.border,
                            borderWidth: 1
                        })}
                    >
                        <Text
                            className={`text-xs font-semibold  ${mmLeading}`}
                            style={{color:APP_COLORS.error}}
                        >
                            {t.actions.reset}
                        </Text>
                    </Pressable>

                    <Pressable
                        className="flex-1 items-center justify-center rounded-xl py-2"
                        style={ ({pressed})=>({
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
    locale: AppLocale;
    mmLeading: string;
    onChangeText: (next: string) => void;
};

function FilterInput({
                         label,
                         value,
                         placeholder,
                         locale,
                         mmLeading,
                         onChangeText,
                     }: FilterInputProps) {
    return (
        <View className="flex-1 gap-1">
            <Text
                className={`text-xs font-semibold ${mmLeading}`}
                style={{color:APP_COLORS.textMuted}}
            >
                {label}
            </Text>
            <CompactTextInput
                locale={locale}
                compactVariant="advanced"
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                className={` ${mmLeading} ${COMPACT_ADVANCED_INPUT_CLASSNAME}`}
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
                         }: FilterDateFieldProps) {
    return (
        <View className="flex-1 gap-1">
            <Text
                className={`text-xs font-semibold ${mmLeading}`}
                style={{color:APP_COLORS.textMuted}}
            >
                {label}
            </Text>
            <ServiceDatePicker
                locale={locale}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                doneLabel={doneLabel}
                mode={mode}
                triggerClassName="h-11 min-h-11"
            />
        </View>
    );
}

function getServiceTypeLabel(item: ServiceTypeItem, locale: "en" | "mm") {
    return locale === "mm" ? item.langMy || item.langEng : item.langEng;
}
