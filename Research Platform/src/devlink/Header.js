"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./Header.module.css";

export function Header({ as: _Component = _Builtin.Section }) {
  return (
    <_Component
      className={_utils.cx(_styles, "hero-latest-news")}
      grid={{
        type: "section",
      }}
      tag="section"
    >
      <_Builtin.Block className={_utils.cx(_styles, "container-24")} tag="div">
        <_Builtin.Block
          className={_utils.cx(_styles, "hero-wrapper-3")}
          tag="div"
        >
          <_Builtin.Block
            className={_utils.cx(_styles, "hero-split-3")}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cx(_styles, "f-breadcrumb-2")}
              tag="div"
            >
              <_Builtin.Block
                className={_utils.cx(_styles, "f-breadcrumb-wrapper-2")}
                tag="div"
              >
                <_Builtin.Link
                  className={_utils.cx(_styles, "f-breadcrumb-home-2")}
                  button={false}
                  block="inline"
                  options={{
                    href: "#",
                  }}
                >
                  <_Builtin.HtmlEmbed
                    className={_utils.cx(_styles, "f-breadcrumb-home-svg-2")}
                    value="%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20d%3D%22M18.6668%2018.6668C18.6668%2018.8878%2018.579%2019.0997%2018.4228%2019.256C18.2665%2019.4123%2018.0545%2019.5001%2017.8335%2019.5001H6.16683C5.94582%2019.5001%205.73385%2019.4123%205.57757%2019.256C5.42129%2019.0997%205.3335%2018.8878%205.3335%2018.6668V11.1668H2.8335L11.4393%203.34343C11.5928%203.20383%2011.7927%203.12646%2012.0002%203.12646C12.2076%203.12646%2012.4076%203.20383%2012.561%203.34343L21.1668%2011.1668H18.6668V18.6668ZM11.1668%2012.8334V17.8334H12.8335V12.8334H11.1668Z%22%20fill%3D%22currentColor%22%2F%3E%0A%3C%2Fsvg%3E"
                  />
                </_Builtin.Link>
                <_Builtin.HtmlEmbed
                  className={_utils.cx(_styles, "f-breadcrumb-seperator-2")}
                  value="%3Csvg%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2032%2032%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20d%3D%22M20%208L11%2023.5885%22%20stroke%3D%22currentColor%22%20stroke-width%3D%221.5%22%2F%3E%0A%3C%2Fsvg%3E"
                />
                <_Builtin.Link
                  className={_utils.cx(_styles, "f-breadcrumb-link-2")}
                  button={false}
                  block="inline"
                  options={{
                    href: "#",
                  }}
                >
                  <_Builtin.Block
                    className={_utils.cx(_styles, "text-block-20")}
                    tag="div"
                  >
                    {"About Us"}
                  </_Builtin.Block>
                </_Builtin.Link>
              </_Builtin.Block>
            </_Builtin.Block>
            <_Builtin.Heading
              className={_utils.cx(_styles, "main-title", "white")}
              tag="h1"
            >
              {"The Canadian Robotics and AI Ethical Design Lab"}
            </_Builtin.Heading>
            <_Builtin.Paragraph
              className={_utils.cx(_styles, "main-subtitle", "white")}
            >
              {
                "Empowering robotics and AI innovators and policymakers to co-create just technological futures "
              }
            </_Builtin.Paragraph>
          </_Builtin.Block>
        </_Builtin.Block>
      </_Builtin.Block>
    </_Component>
  );
}
