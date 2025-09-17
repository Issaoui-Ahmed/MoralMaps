"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./CtaDonate.module.css";

export function CtaDonate({ as: _Component = _Builtin.Block }) {
  return (
    <_Component className={_utils.cx(_styles, "cta")} tag="div">
      <_Builtin.Block className={_utils.cx(_styles, "cta-container")} tag="div">
        <_Builtin.Grid
          className={_utils.cx(_styles, "cta-grid-column")}
          tag="div"
        >
          <_Builtin.Block
            className={_utils.cx(_styles, "cta-wrapper")}
            id={_utils.cx(
              _styles,
              "w-node-b2b83575-aab5-3194-d11c-6ea9b525a75d-b525a75a"
            )}
            tag="div"
          >
            <_Builtin.Image
              className={_utils.cx(_styles, "f-image-cover")}
              loading="lazy"
              height="auto"
              width="auto"
              alt=""
              src="https://cdn.prod.website-files.com/65cfae1b28b38affea9aa27e/65f241e2f2d151043f1c82f7_Media.webp"
            />
          </_Builtin.Block>
          <_Builtin.Block tag="div">
            <_Builtin.Block
              className={_utils.cx(_styles, "main-text")}
              tag="div"
            >
              <_Builtin.Heading
                className={_utils.cx(_styles, "donate-heading")}
                tag="h1"
              >
                {"Support"}
              </_Builtin.Heading>
              <_Builtin.Heading
                className={_utils.cx(_styles, "heading-blue", "support")}
                tag="h3"
              >
                {"research that creates equitable technological futures"}
              </_Builtin.Heading>
            </_Builtin.Block>
            <_Builtin.Block className={_utils.cx(_styles, "buttons")} tag="div">
              <_Builtin.Link
                className={_utils.cx(_styles, "button")}
                button={false}
                block="inline"
                options={{
                  href: "#",
                }}
              >
                <_Builtin.Block tag="div">{"DONATENOW"}</_Builtin.Block>
              </_Builtin.Link>
              <_Builtin.Link
                className={_utils.cx(_styles, "button")}
                button={false}
                block="inline"
                options={{
                  href: "#",
                }}
              >
                <_Builtin.Block tag="div">{"CONTACTUS"}</_Builtin.Block>
              </_Builtin.Link>
            </_Builtin.Block>
          </_Builtin.Block>
        </_Builtin.Grid>
      </_Builtin.Block>
    </_Component>
  );
}
