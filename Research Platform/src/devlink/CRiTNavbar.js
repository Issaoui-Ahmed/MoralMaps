"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./CRiTNavbar.module.css";

export function CRiTNavbar({ as: _Component = _Builtin.Block }) {
  return (
    <_Component className={_utils.cx(_styles, "hero-nav")} tag="div">
      <_Builtin.Block
        className={_utils.cx(_styles, "hero-nav_button-wrapper")}
        tag="div"
      >
        <_Builtin.Link
          className={_utils.cx(_styles, "button-icon-small")}
          button={false}
          block="inline"
          options={{
            href: "#",
          }}
        >
          <_Builtin.Block
            className={_utils.cx(_styles, "text-block-31")}
            tag="div"
          >
            {"The CRiT Toolkit"}
          </_Builtin.Block>
        </_Builtin.Link>
      </_Builtin.Block>
      <_Builtin.Block
        className={_utils.cx(_styles, "hero-nav_button-wrapper")}
        tag="div"
      >
        <_Builtin.Link
          className={_utils.cx(_styles, "button-icon-small")}
          button={false}
          block="inline"
          options={{
            href: "#",
          }}
        >
          <_Builtin.Block
            className={_utils.cx(_styles, "text-block-31")}
            tag="div"
          >
            {"About Us"}
          </_Builtin.Block>
        </_Builtin.Link>
      </_Builtin.Block>
    </_Component>
  );
}
