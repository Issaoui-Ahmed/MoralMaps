"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./SideMenuLinks.module.css";

export function SideMenuLinks({ as: _Component = _Builtin.Link, link }) {
  return (
    <_Component
      className={_utils.cx(_styles, "link")}
      button={false}
      block=""
      options={{
        href: "#",
      }}
    >
      <_Builtin.Strong>{"Projects"}</_Builtin.Strong>
    </_Component>
  );
}
