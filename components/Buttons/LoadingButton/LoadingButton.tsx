import { FC, useState } from "react";
import styles from "./LoadingButton.module.scss";

interface Props {
    className: string,
    onClick: () => void,
    loading: boolean
}

const LoadingButton: FC<Props> = ({ children, className, onClick, loading }) => {
    return (
        <button className={`${className} ${styles.LoadingButton} ${loading ? styles.loading : ""}`} onClick={onClick} aria-label="See more">
            {children}
            {loading ? <span className={styles.circle}/> : null}
        </button>
    )
}

export default LoadingButton;