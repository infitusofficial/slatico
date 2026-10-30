import { createElement, type ReactNode } from "react";

function createMockNativeComponent(tagName: string) {
  return function MockNativeComponent(props: Record<string, unknown>) {
    const {
      children,
      onPress,
      onChangeText,
      placeholderTextColor,
      autoCapitalize,
      autoCorrect,
      barStyle,
      backgroundColor,
      contentContainerStyle,
      style,
      numberOfLines,
      value,
      ...rest
    } = props;
    const mapped: Record<string, unknown> = {
      ...rest,
      "data-rn-component": tagName
    };
    if (numberOfLines !== undefined) {
      mapped["data-number-of-lines"] = String(numberOfLines);
    }
    if (value !== undefined) {
      mapped["defaultValue"] = String(value);
    }
    if (typeof onPress === "function") {
      mapped["data-pressable"] = "true";
    }
    if (typeof onChangeText === "function") {
      mapped["data-text-input"] = "true";
    }
    if (placeholderTextColor !== undefined) {
      mapped["data-placeholder-color"] = String(placeholderTextColor);
    }
    if (autoCapitalize !== undefined) {
      mapped["data-auto-capitalize"] = String(autoCapitalize);
    }
    if (autoCorrect !== undefined) {
      mapped["data-auto-correct"] = String(autoCorrect);
    }
    if (barStyle !== undefined) {
      mapped["data-bar-style"] = String(barStyle);
    }
    if (backgroundColor !== undefined) {
      mapped["data-bg-color"] = String(backgroundColor);
    }
    if (contentContainerStyle !== undefined || style !== undefined) {
      mapped["data-styled"] = "true";
    }
    return createElement(tagName, mapped, children as ReactNode);
  };
}

export const View = createMockNativeComponent("div");
export const SafeAreaView = createMockNativeComponent("main");
export const ScrollView = createMockNativeComponent("section");
export const Text = createMockNativeComponent("span");
export const Pressable = createMockNativeComponent("button");
export const TextInput = createMockNativeComponent("input");
export const StatusBar = createMockNativeComponent("meta");

export const StyleSheet = {
  create<T extends Record<string, unknown>>(styles: T): T {
    return styles;
  }
};
