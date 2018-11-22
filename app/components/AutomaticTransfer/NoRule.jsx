import React from "react";
export default function NoRule(props) {
  return (
    <div className="no_rule">
      <img src={props.src} alt="" />
      <p>{props.text}</p>
    </div>
  )
}