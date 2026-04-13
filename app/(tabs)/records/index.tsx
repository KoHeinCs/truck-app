import { Card } from "heroui-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RecordsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-100 px-5 py-6">
      <Card>
        <Card.Header>
          <Card.Title>Records</Card.Title>
          <Card.Description>Truck records screen placeholder.</Card.Description>
        </Card.Header>
      </Card>
    </SafeAreaView>
  );
}
