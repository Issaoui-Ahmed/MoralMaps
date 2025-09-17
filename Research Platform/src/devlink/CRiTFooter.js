"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./CRiTFooter.module.css";

export function CRiTFooter({ as: _Component = _Builtin.Block }) {
  return (
    <_Component className={_utils.cx(_styles, "section-footer")} tag="div">
      <_Builtin.Block
        className={_utils.cx(_styles, "background-layer")}
        tag="div"
      />
      <_Builtin.Block
        className={_utils.cx(_styles, "crit-container")}
        tag="div"
      >
        <_Builtin.Block
          className={_utils.cx(_styles, "padding-vertical-footer")}
          tag="div"
        >
          <_Builtin.Block
            className={_utils.cx(_styles, "footer_text-wrapper")}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cx(_styles, "margin-bottom-medium")}
              tag="div"
            >
              <_Builtin.Heading
                className={_utils.cx(_styles, "crit-h4")}
                tag="h4"
              >
                {"Powered by"}
              </_Builtin.Heading>
            </_Builtin.Block>
            <_Builtin.Block
              className={_utils.cx(_styles, "button-wrapper")}
              tag="div"
            >
              <_Builtin.Link
                className={_utils.cx(_styles, "button-icon-small-secondary")}
                button={false}
                block="inline"
                options={{
                  href: "#",
                }}
              >
                <_Builtin.Image
                  className={_utils.cx(_styles, "image-37")}
                  loading="lazy"
                  width="auto"
                  height="auto"
                  alt=""
                  src="https://cdn.prod.website-files.com/65cfae1b28b38affea9aa27e/65e8f4d620401f020cb73777_CRAiEDL%20Logo%20-%20Black%20Text%20BigCirc%202.jpg"
                />
              </_Builtin.Link>
            </_Builtin.Block>
            <_Builtin.Heading
              className={_utils.cx(_styles, "footer-text")}
              tag="h4"
            >
              {
                "Canadian Robotics and Artificial Intelligence Ethical Design Lab"
              }
            </_Builtin.Heading>
          </_Builtin.Block>
          <_Builtin.Block
            className={_utils.cx(_styles, "footer_credits-wrapper")}
            tag="div"
          >
            <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-20")}>
              {"© 2024, CRAiEDL. All Rights Reserved."}
            </_Builtin.Paragraph>
          </_Builtin.Block>
        </_Builtin.Block>
      </_Builtin.Block>
    </_Component>
  );
}
