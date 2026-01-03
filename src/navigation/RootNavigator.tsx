import { USE_MOCKS } from "@/utils/devToggle";
import React, { forwardRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthNavigator } from "./AuthNavigator";
import { MainTabsNavigator } from "./MainTabsNavigator";
import { useAppSelector } from "@/store";

export const RootNavigator = forwardRef<any, {}>((props, ref) => {
  const status = useAppSelector((s) => s.auth.status);
  // const isAuthed = USE_MOCKS ? status !== 'unauthenticated' : status === 'authenticated';
  const isAuthed = status === "authenticated";
  return (
    <NavigationContainer ref={ref}>
      {isAuthed ? <MainTabsNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
});
