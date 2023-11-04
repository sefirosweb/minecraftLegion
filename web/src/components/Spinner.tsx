import React from "react";
import style from "@/css/Spinner.module.scss";

export const Spinner: React.FC = () => (
  <div className='center'>
    <div className={style.ldsHourglass} />
  </div>
)