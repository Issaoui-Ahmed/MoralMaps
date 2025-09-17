"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./Heading1.module.css";

export function Heading1({ as: _Component = _Builtin.Heading }) {
  return (
    <_Component className={_utils.cx(_styles, "heading-1")} tag="h1">
      {"Our Goal"}
    </_Component>
  );
}
