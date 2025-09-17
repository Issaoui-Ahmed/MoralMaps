"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./NavigationBar.module.css";

export function NavigationBar({ as: _Component = _Builtin.NavbarWrapper }) {
  return (
    <_Component
      className={_utils.cx(_styles, "navbar")}
      tag="div"
      config={{
        animation: "default",
        collapse: "medium",
        docHeight: true,
        duration: 400,
        easing: "ease",
        easing2: "ease",
        noScroll: false,
      }}
    >
      <_Builtin.NavbarContainer
        className={_utils.cx(_styles, "container-15")}
        tag="div"
      >
        <_Builtin.NavbarBrand
          options={{
            href: "#",
          }}
        >
          <_Builtin.Image
            width="auto"
            height="50"
            loading="lazy"
            alt=""
            src="https://cdn.prod.website-files.com/65cfae1b28b38affea9aa27e/65e8f4d53174ae624f0395a9_CRAiEDL%20Logo%20-%20Black%20Text%20BigCirc%202.png"
          />
        </_Builtin.NavbarBrand>
        <_Builtin.NavbarMenu
          className={_utils.cx(_styles, "nav-menu")}
          tag="nav"
          role="navigation"
        >
          <_Builtin.NavbarLink
            className={_utils.cx(_styles, "nav-button")}
            options={{
              href: "#",
            }}
          >
            {"About Us"}
          </_Builtin.NavbarLink>
          <_Builtin.DropdownWrapper
            className={_utils.cx(_styles, "", "dropdown")}
            tag="div"
            delay={0}
            hover={false}
          >
            <_Builtin.DropdownToggle
              className={_utils.cx(_styles, "nav-button")}
              tag="div"
            >
              <_Builtin.Link
                className={_utils.cx(_styles, "nav-button")}
                button={false}
                block="inline"
                options={{
                  href: "#",
                }}
              >
                <_Builtin.Icon
                  widget={{
                    type: "icon",
                    icon: "dropdown-toggle",
                  }}
                />
                <_Builtin.Block
                  className={_utils.cx(_styles, "nav-button")}
                  tag="div"
                >
                  {"Research"}
                </_Builtin.Block>
              </_Builtin.Link>
            </_Builtin.DropdownToggle>
            <_Builtin.DropdownList
              className={_utils.cx(_styles, "dropdown-list", "dropdown-list-2")}
              tag="nav"
            >
              <_Builtin.DropdownLink
                className={_utils.cx(_styles, "nav-button")}
                options={{
                  href: "#",
                }}
              >
                {"Robotics and AI Policy"}
              </_Builtin.DropdownLink>
              <_Builtin.DropdownLink
                className={_utils.cx(_styles, "nav-button")}
                options={{
                  href: "#",
                }}
              >
                {"Ethical Design Tools"}
              </_Builtin.DropdownLink>
              <_Builtin.DropdownLink
                className={_utils.cx(_styles, "nav-button")}
                options={{
                  href: "#",
                }}
              >
                {"Automated Mobility"}
              </_Builtin.DropdownLink>
              <_Builtin.DropdownLink
                className={_utils.cx(_styles, "nav-button")}
                options={{
                  href: "#",
                }}
              >
                {"CRAiEDL STEAM Collective"}
              </_Builtin.DropdownLink>
              <_Builtin.DropdownLink
                className={_utils.cx(_styles, "nav-button")}
                options={{
                  href: "#",
                }}
              >
                {"Healthcare Robotics and AI"}
              </_Builtin.DropdownLink>
              <_Builtin.DropdownLink
                className={_utils.cx(_styles, "nav-button")}
                options={{
                  href: "#",
                }}
              >
                {"Lethal Autonomous Weapons"}
              </_Builtin.DropdownLink>
            </_Builtin.DropdownList>
          </_Builtin.DropdownWrapper>
          <_Builtin.NavbarLink
            className={_utils.cx(_styles, "nav-button")}
            options={{
              href: "#",
            }}
          >
            {"Our Team"}
          </_Builtin.NavbarLink>
          <_Builtin.NavbarLink
            className={_utils.cx(_styles, "nav-button")}
            options={{
              href: "#",
            }}
          >
            {"News"}
          </_Builtin.NavbarLink>
        </_Builtin.NavbarMenu>
        <_Builtin.NavbarButton
          className={_utils.cx(_styles, "menu-button-3")}
          tag="div"
        >
          <_Builtin.Icon
            className={_utils.cx(_styles, "", "nav-dropdown-icon")}
            widget={{
              type: "icon",
              icon: "nav-menu",
            }}
          />
        </_Builtin.NavbarButton>
      </_Builtin.NavbarContainer>
    </_Component>
  );
}
