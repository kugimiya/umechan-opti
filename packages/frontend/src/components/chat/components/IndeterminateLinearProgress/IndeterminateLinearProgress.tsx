"use client";

import { FC } from "react";
import clsx from "clsx";
import styles from "./IndeterminateLinearProgress.module.css";

type Props = {
  className?: string;
};

/** Тонкая полоска загрузки в духе Material/Android: два цвета, бесконечное движение по горизонтали */
export const IndeterminateLinearProgress: FC<Props> = ({ className }) => (
  <div
    className={clsx(styles.track, className)}
    role="progressbar"
    aria-busy="true"
    aria-valuetext="Загрузка"
  >
    <div className={styles.bar} />
  </div>
);
