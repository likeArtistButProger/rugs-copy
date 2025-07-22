import type { ComponentPropsWithoutRef, FC } from "react";
import "./button.css";

export const Button: FC<ComponentPropsWithoutRef<"button">> = ({ children, ...props }) => {
    return (
        <button
            className="rugs-button"
            {...props}
        >
            {children}
        </button>
    )
}