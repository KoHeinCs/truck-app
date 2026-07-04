import { CompactSelect } from "@/app/(tabs)/profile/user/components/compact-select";
import { APP_COLORS } from "@/constants/colors";
import {
  getMyanmarLeadingClass,
  myanmarUITextStyle,
} from "@/constants/myanmar-font";
import { useTranslation } from "@/hooks/use-translation";
import { useLocaleStore } from "@/stores/client/locale-store";
import { useOwnerLookupOptions } from "@/stores/server/ownership/owner-lookup-query";
import React, { useMemo } from "react";
import { Text, View } from "react-native";

type DashboardOwnerSelectProps = {
  value: string;
  onChange: (ownerId: string) => void;
};

const DashboardOwnerSelect = ({
  value,
  onChange,
}: DashboardOwnerSelectProps) => {
  const locale = useLocaleStore((state) => state.locale);
  const t = useTranslation("home");
  const { data: ownerSelectOptions = [] } = useOwnerLookupOptions("");

  const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
  const textStyle = locale === "mm" ? mmTextStyle : undefined;
  const mmLeading = getMyanmarLeadingClass(locale);

  return (
    <View
      className="rounded-2xl p-4"
      style={{
        backgroundColor: APP_COLORS.card,
        borderColor: APP_COLORS.border,
        borderWidth: 1,
      }}
    >
      <Text
        className={`mb-3 text-base font-bold text-slate-900 ${mmLeading}`}
        style={textStyle}
      >
        {t.dashboardTitle}
      </Text>
      <CompactSelect
        label={t.ownerIdLabel}
        value={value}
        onChange={onChange}
        locale={locale}
        placeholder={t.ownerIdPlaceholder}
        options={ownerSelectOptions}
      />
    </View>
  );
};

export default DashboardOwnerSelect;
