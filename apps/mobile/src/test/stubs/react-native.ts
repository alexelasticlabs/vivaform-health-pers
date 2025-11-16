import React from "react";

const createComponent = (tag: keyof JSX.IntrinsicElements) =>
  React.forwardRef<any, any>((props, ref) => React.createElement(tag, { ref, ...props }));

export const View = createComponent("div");
export const Text = createComponent("span");
export const ScrollView = createComponent("div");
export const TouchableOpacity = createComponent("button");
export const ActivityIndicator = (props: { size?: string; color?: string }) => (
  <div role="status" style={{ color: props.color }}>{props.size ?? "loading"}</div>
);
export const StyleSheet = {
  create: (styles: Record<string, any>) => styles
};

export default {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
};
