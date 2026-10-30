import { createElement, type ReactNode } from "react";

function createMockSvgPrimitive(tagName: string) {
  return function MockSvgPrimitive(props: Record<string, unknown>) {
    const {
      children,
      accessible,
      accessibilityRole,
      accessibilityLabel,
      ...rest
    } = props;
    const mapped: Record<string, unknown> = { ...rest };
    if (accessible !== undefined) {
      mapped["data-accessible"] = String(accessible);
    }
    if (accessibilityRole !== undefined) {
      mapped["data-accessibility-role"] = String(accessibilityRole);
    }
    if (accessibilityLabel !== undefined) {
      mapped["data-accessibility-label"] = String(accessibilityLabel);
    }
    return createElement(tagName, mapped, children as ReactNode);
  };
}

export const Svg = createMockSvgPrimitive("svg");
export const Path = createMockSvgPrimitive("path");
export const Circle = createMockSvgPrimitive("circle");
export const Rect = createMockSvgPrimitive("rect");
export const Line = createMockSvgPrimitive("line");
export const Polyline = createMockSvgPrimitive("polyline");
export const Polygon = createMockSvgPrimitive("polygon");
export const Ellipse = createMockSvgPrimitive("ellipse");
export const G = createMockSvgPrimitive("g");
export const Defs = createMockSvgPrimitive("defs");
export const LinearGradient = createMockSvgPrimitive("linearGradient");
export const RadialGradient = createMockSvgPrimitive("radialGradient");
export const Stop = createMockSvgPrimitive("stop");
export const ClipPath = createMockSvgPrimitive("clipPath");
export const Mask = createMockSvgPrimitive("mask");
export const Use = createMockSvgPrimitive("use");
