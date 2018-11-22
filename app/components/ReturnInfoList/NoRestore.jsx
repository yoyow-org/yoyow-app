import React from "react";
export default function NoRestore(props) {
  return (
    <div className="no_restore">
      <img src={props.src} alt="" />
      <p>{props.text}</p>
    </div>
  )
}