import * as React from "react";
import * as Types from "./types";

declare function Footer(props: {
  as?: React.ElementType;
  footerLogoVisibility?: Types.Visibility.VisibilityConditions;
  footerLogoMobile?: Types.Visibility.VisibilityConditions;
}): React.JSX.Element;
