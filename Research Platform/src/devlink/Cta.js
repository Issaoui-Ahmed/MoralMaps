"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./Cta.module.css";

export function Cta({ as: _Component = _Builtin.Section }) {
  return (
    <_Component
      className={_utils.cx(_styles, "cta-section")}
      grid={{
        type: "section",
      }}
      tag="section"
    >
      <_Builtin.Grid className={_utils.cx(_styles, "cta-grid")} tag="div">
        <_Builtin.Image
          className={_utils.cx(_styles, "cta-image")}
          id={_utils.cx(
            _styles,
            "w-node-_7e61b41c-d0ac-bf33-d781-80867bc3c9d0-7bc3c9ce"
          )}
          loading="lazy"
          width="318"
          height="auto"
          alt=""
          src="https://cdn.prod.website-files.com/65cfae1b28b38affea9aa27e/65eb271fe52a23c403c33c7b_avatar-49.webp"
        />
        <_Builtin.BlockContainer
          className={_utils.cx(_styles, "cta-content")}
          id={_utils.cx(
            _styles,
            "w-node-_7e61b41c-d0ac-bf33-d781-80867bc3c9d1-7bc3c9ce"
          )}
          grid={{
            type: "container",
          }}
          tag="div"
        >
          <_Builtin.Heading
            className={_utils.cx(_styles, "heading-23")}
            tag="h1"
          >
            <_Builtin.Span>{"Donate"}</_Builtin.Span>
            <br />
            {"to empower research towards technological future"}
          </_Builtin.Heading>
          <_Builtin.Link
            className={_utils.cx(_styles, "button-white", "button-space")}
            id={_utils.cx(
              _styles,
              "w-node-_7e61b41c-d0ac-bf33-d781-80867bc3c9d7-7bc3c9ce"
            )}
            button={true}
            block=""
            options={{
              href: "#",
            }}
          >
            {"Donate Now"}
          </_Builtin.Link>
        </_Builtin.BlockContainer>
      </_Builtin.Grid>
    </_Component>
  );
}
