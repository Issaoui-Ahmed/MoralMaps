"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./NavbarNew.module.css";

export function NavbarNew({ as: _Component = _Builtin.NavbarWrapper }) {
  return (
    <_Component
      className={_utils.cx(_styles, "efi-nav-01")}
      tag="div"
      config={{
        animation: "default",
        collapse: "medium",
        docHeight: false,
        duration: 400,
        easing: "ease",
        easing2: "ease",
        noScroll: false,
      }}
    >
      <_Builtin.Block
        className={_utils.cx(_styles, "page-wrapper-2")}
        tag="div"
      >
        <_Builtin.Block
          className={_utils.cx(_styles, "div-block-34")}
          tag="div"
        >
          <_Builtin.Block
            className={_utils.cx(_styles, "container-large", "navbar")}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cx(_styles, "div-block-59")}
              tag="div"
            >
              <_Builtin.NavbarBrand
                className={_utils.cx(_styles, "efi-brand")}
                options={{
                  href: "#",
                }}
              >
                <_Builtin.Image
                  className={_utils.cx(_styles, "image-27")}
                  width="auto"
                  height="50"
                  loading="lazy"
                  alt=""
                  src="https://cdn.prod.website-files.com/65cfae1b28b38affea9aa27e/65e8f4d53174ae624f0395a9_CRAiEDL%20Logo%20-%20Black%20Text%20BigCirc%202.png"
                />
              </_Builtin.NavbarBrand>
              <_Builtin.NavbarMenu
                className={_utils.cx(_styles, "efi-nav-01-nav-menu")}
                tag="nav"
                role="navigation"
              >
                <_Builtin.NavbarLink
                  className={_utils.cx(_styles, "efi-nav-link", "light")}
                  options={{
                    href: "#",
                  }}
                >
                  {"About Us"}
                </_Builtin.NavbarLink>
                <_Builtin.DropdownWrapper
                  className={_utils.cx(_styles, "dropdown-2")}
                  tag="div"
                  delay={0}
                  hover={true}
                >
                  <_Builtin.DropdownToggle
                    className={_utils.cx(_styles, "dropdown-toggle")}
                    tag="div"
                  >
                    <_Builtin.Icon
                      widget={{
                        type: "icon",
                        icon: "dropdown-toggle",
                      }}
                    />
                    <_Builtin.Link
                      className={_utils.cx(_styles, "efi-nav-link", "trial")}
                      button={false}
                      block="inline"
                      options={{
                        href: "#",
                      }}
                    >
                      <_Builtin.Block
                        className={_utils.cx(_styles, "efi-nav-link", "light")}
                        tag="div"
                      >
                        {"Research"}
                      </_Builtin.Block>
                    </_Builtin.Link>
                  </_Builtin.DropdownToggle>
                  <_Builtin.DropdownList tag="nav">
                    <_Builtin.DropdownLink
                      className={_utils.cx(
                        _styles,
                        "dropdown-link",
                        "background-color-white"
                      )}
                      options={{
                        href: "#",
                      }}
                    >
                      {"Robotics and AI Policy"}
                    </_Builtin.DropdownLink>
                    <_Builtin.DropdownLink
                      className={_utils.cx(
                        _styles,
                        "dropdown-link",
                        "background-color-white"
                      )}
                      options={{
                        href: "#",
                      }}
                    >
                      {"Ethical Design Tools"}
                    </_Builtin.DropdownLink>
                    <_Builtin.DropdownLink
                      className={_utils.cx(
                        _styles,
                        "dropdown-link",
                        "background-color-white"
                      )}
                      options={{
                        href: "#",
                      }}
                    >
                      {"Automated Mobility"}
                    </_Builtin.DropdownLink>
                    <_Builtin.DropdownLink
                      className={_utils.cx(
                        _styles,
                        "dropdown-link",
                        "background-color-white"
                      )}
                      options={{
                        href: "#",
                      }}
                    >
                      {"CRAiEDL STEAM Collective"}
                    </_Builtin.DropdownLink>
                    <_Builtin.DropdownLink
                      className={_utils.cx(
                        _styles,
                        "dropdown-link",
                        "background-color-white"
                      )}
                      options={{
                        href: "#",
                      }}
                    >
                      {"Healthcare Robotics and AI"}
                    </_Builtin.DropdownLink>
                    <_Builtin.DropdownLink
                      className={_utils.cx(
                        _styles,
                        "dropdown-link",
                        "background-color-white"
                      )}
                      options={{
                        href: "#",
                      }}
                    >
                      {"Autonomous Weapons Systems"}
                    </_Builtin.DropdownLink>
                  </_Builtin.DropdownList>
                </_Builtin.DropdownWrapper>
                <_Builtin.NavbarLink
                  className={_utils.cx(_styles, "efi-nav-link", "light")}
                  options={{
                    href: "#",
                  }}
                >
                  {"News"}
                </_Builtin.NavbarLink>
              </_Builtin.NavbarMenu>
              <_Builtin.NavbarButton
                className={_utils.cx(_styles, "efi-button-menu")}
                tag="div"
              >
                <_Builtin.Icon
                  className={_utils.cx(_styles, "efi-icon")}
                  widget={{
                    type: "icon",
                    icon: "nav-menu",
                  }}
                />
              </_Builtin.NavbarButton>
            </_Builtin.Block>
          </_Builtin.Block>
        </_Builtin.Block>
      </_Builtin.Block>
    </_Component>
  );
}
