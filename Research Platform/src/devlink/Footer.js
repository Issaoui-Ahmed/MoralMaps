"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./Footer.module.css";

export function Footer({
  as: _Component = _Builtin.Section,
  footerLogoVisibility = true,
  footerLogoMobile = false,
}) {
  return (
    <_Component
      className={_utils.cx(_styles, "footer", "mobile-portrait")}
      grid={{
        type: "section",
      }}
      tag="section"
    >
      <_Builtin.Block
        className={_utils.cx(_styles, "container-large")}
        tag="div"
      >
        <_Builtin.Grid className={_utils.cx(_styles, "footer-grid")} tag="div">
          <_Builtin.Block
            className={_utils.cx(_styles, "footer-column")}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cx(_styles, "div-block-40")}
              id={_utils.cx(
                _styles,
                "w-node-ce88f852-b9b6-d7bf-178b-3d09fdecf73f-349337c0"
              )}
              tag="div"
            >
              <_Builtin.Image
                className={_utils.cx(_styles, "", "footer-logo")}
                id={_utils.cx(
                  _styles,
                  "w-node-_0f101024-2c53-3d22-abdd-6912349337c4-349337c0"
                )}
                loading="lazy"
                width="auto"
                height="50"
                alt=""
                src="https://cdn.prod.website-files.com/65cfae1b28b38affea9aa27e/65e8f4d53174ae624f0395a9_CRAiEDL%20Logo%20-%20Black%20Text%20BigCirc%202.png"
              />
              {footerLogoMobile ? (
                <_Builtin.Image
                  loading="lazy"
                  width="auto"
                  height="auto"
                  alt=""
                  src="https://cdn.prod.website-files.com/65cfae1b28b38affea9aa27e/665d3b4ae85cb883f849278e_CRAiEDL%20Logo%20Square%20Whitespace%20Background%20Removed%20(1).png"
                />
              ) : null}
              <_Builtin.Block
                className={_utils.cx(_styles, "text-block-29")}
                tag="div"
              >
                {
                  "The Canadian Robotics and Artificial Intelligence Ethical Design Lab"
                }
              </_Builtin.Block>
            </_Builtin.Block>
          </_Builtin.Block>
          <_Builtin.VFlex
            className={_utils.cx(_styles, "footer-column")}
            id={_utils.cx(
              _styles,
              "w-node-_0f101024-2c53-3d22-abdd-6912349337c7-349337c0"
            )}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cx(_styles, "title-small-4", "footer-column")}
              tag="div"
            >
              {"Resources"}
            </_Builtin.Block>
            <_Builtin.Link
              className={_utils.cx(_styles, "footer-link-4")}
              button={false}
              block=""
              options={{
                href: "#",
              }}
            >
              {"About Us"}
            </_Builtin.Link>
            <_Builtin.Link
              className={_utils.cx(_styles, "footer-link-4")}
              button={false}
              block=""
              options={{
                href: "#",
              }}
            >
              {"Research"}
            </_Builtin.Link>
            <_Builtin.Link
              className={_utils.cx(_styles, "footer-link-4")}
              button={false}
              block=""
              options={{
                href: "#",
              }}
            >
              {"News"}
            </_Builtin.Link>
          </_Builtin.VFlex>
          <_Builtin.VFlex
            className={_utils.cx(_styles, "footer-column")}
            id={_utils.cx(
              _styles,
              "w-node-def81f07-883c-8ebc-1e0a-ea9d343a4259-349337c0"
            )}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cx(_styles, "title-small-4", "footer-column")}
              tag="div"
            >
              {"Connect WITHUS"}
            </_Builtin.Block>
            <_Builtin.Link
              className={_utils.cx(_styles, "footer-link-4")}
              button={false}
              block=""
              options={{
                href: "mailto:jmillar@uottawa.com",
              }}
            >
              {"Contact Us"}
            </_Builtin.Link>
            <_Builtin.Link
              className={_utils.cx(_styles, "footer-link-4")}
              button={false}
              block=""
              options={{
                href: "https://www.youtube.com/@CRAiEDL-uO",
                target: "_blank",
              }}
            >
              {"Our YouTube"}
            </_Builtin.Link>
            <_Builtin.Link
              className={_utils.cx(_styles, "footer-link-4")}
              button={false}
              block=""
              options={{
                href: "#",
              }}
            >
              {"The CRiT Toolkit"}
            </_Builtin.Link>
          </_Builtin.VFlex>
          <_Builtin.VFlex
            className={_utils.cx(_styles, "footer-column")}
            id={_utils.cx(
              _styles,
              "w-node-eb0f3774-0601-68ab-6ca9-4a9dec2b275a-349337c0"
            )}
            tag="div"
          />
        </_Builtin.Grid>
      </_Builtin.Block>
    </_Component>
  );
}
