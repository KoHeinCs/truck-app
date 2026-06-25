import { AdvanceSearchDatePicker } from "@/components/advance-search-date-picker";
import { CompactTextInput } from "@/components/compact-text-input";
import { APP_COLORS } from "@/constants/colors";
import { COMPACT_ADVANCED_INPUT_CLASSNAME } from "@/constants/compact-input";
import { getMyanmarLeadingClass } from "@/constants/myanmar-font";
import { useTranslation } from "@/hooks/use-translation";
import type { AppLocale } from "@/stores/client/locale-store";
import type { ProposalAdvancedFilters as ProposalAdvancedFilterValues } from "@/stores/server/proposal/search-columns";
import { Card } from "heroui-native";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { CompactSelect } from "../profile/user/components/compact-select";

type ProposalAdvancedFiltersProps = {
    filters: ProposalAdvancedFilterValues;
    locale: AppLocale;
    showOwnerId: boolean;
    showCreatedBy: boolean;
    onChange: (next: Partial<ProposalAdvancedFilterValues>) => void;
    onReset: () => void;
    onApply: () => void;
    style: any;
    userOptions:any
};

export function ProposalAdvancedFilters({
                                            filters,
                                            locale,
                                            showOwnerId,
                                            showCreatedBy,
                                            onChange,
                                            onReset,
                                            onApply,
                                            style,
                                            userOptions
                                        }: ProposalAdvancedFiltersProps) {

    const {search: t} = useTranslation('proposal')
    const tCommon = useTranslation("common");
    const mmLeading = getMyanmarLeadingClass(locale);

    const ownerOptions = userOptions
        .filter((user: { role: string }) => user.role === "OWNER")
        .map((user: { value: string; label: string }) => ({
            value: user.value,
            label: user.label
        }));

    const informUserOptions = userOptions
        .filter((user: { role: string }) => user.role !== "VIEWER")
        .map((user: { value: string; label: string }) => ({
            value: user.value,
            label: user.label
        }));

    const informUserSelectOptions = useMemo(
        () => [{value:"",label:tCommon.anyLabel}, ...informUserOptions],
        [informUserOptions,tCommon.anyLabel]
    );


    const ownerSelectOptions = useMemo(
        () => [{value: "", label: tCommon.anyLabel}, ...ownerOptions],
        [ownerOptions, tCommon.anyLabel],
    );

    return (
        <Card
            className="mb-4 p-5"
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

                {/* proposal number , plate number */}
                <View className="flex-row gap-2">
                    <FilterInput
                        label={t.labels.proposalNo}
                        value={filters.proposalNo}
                        placeholder={t.placeholders.proposalNo}
                        locale={locale}
                        mmLeading={mmLeading}
                        onChangeText={(proposalNo) => onChange({proposalNo})}
                        style={style}
                    />
                    <FilterInput
                        label={t.labels.plateNo}
                        value={filters.plateNo}
                        placeholder={t.placeholders.plateNo}
                        locale={locale}
                        mmLeading={mmLeading}
                        onChangeText={(plateNo) => onChange({plateNo})}
                        style={style}
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
                        doneLabel={locale === "mm" ? "ရွေးချယ်မည်" : "Done"}
                        mode="date"
                        onChange={(proposalDateFrom) => onChange({proposalDateFrom})}
                        style={style}
                    />
                    <FilterDateField
                        label={t.labels.proposalDateTo}
                        value={filters.proposalDateTo}
                        placeholder={t.placeholders.proposalDateTo}
                        locale={locale}
                        mmLeading={mmLeading}
                        doneLabel={locale === "mm" ? "ရွေးချယ်မည်" : "Done"}
                        mode="date"
                        onChange={(proposalDateTo) => onChange({proposalDateTo})}
                        style={style}
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
                        doneLabel={locale === "mm" ? "ရွေးချယ်မည်" : "Done"}
                        onChange={(serviceDateFrom) => onChange({serviceDateFrom})}
                        style={style}
                    />
                    <FilterDateField
                        label={t.labels.serviceDateTo}
                        value={filters.serviceDateTo}
                        placeholder={t.placeholders.serviceDateTo}
                        locale={locale}
                        mmLeading={mmLeading}
                        doneLabel={locale === "mm" ? "ရွေးချယ်မည်" : "Done"}
                        onChange={(serviceDateTo) => onChange({serviceDateTo})}
                        style={style}
                    />
                </View>

                {showOwnerId ? (
                    <CompactSelect
                        label={t.labels.ownerId}
                        value={filters.ownerId}
                        onChange={(ownerId) => onChange({ownerId})}
                        locale={locale}
                        placeholder={t.placeholders.ownerId}
                        options={ownerSelectOptions}
                    />
                ) : null}

                {/* created user */}
                {showCreatedBy ? (
                    <CompactSelect
                        label={t.labels.createdBy}
                        value={filters.createdByCsv}
                        onChange={(createdByCsv) => onChange({createdByCsv})}
                        locale={locale}
                        placeholder={t.placeholders.createdBy}
                        options={informUserSelectOptions}
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
    locale: AppLocale;
    mmLeading: string;
    onChangeText: (next: string) => void;
    style: any
};

function FilterInput({
                         label,
                         value,
                         placeholder,
                         locale,
                         mmLeading,
                         onChangeText,
                         style
                     }: FilterInputProps) {
    return (
        <View className="flex-1 gap-1">
            <Text
                className={`text-sm font-medium ${mmLeading}`}
                style={[{color: APP_COLORS.textMuted},style]}
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
                style={[{color: APP_COLORS.textMuted},style]}
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
                maximumDate={new Date()}
            />
        </View>
    );
}

