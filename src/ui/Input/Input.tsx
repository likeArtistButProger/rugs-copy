import type { ComponentPropsWithoutRef, FC } from "react";
import "./input.css";

export const Input: FC<ComponentPropsWithoutRef<"input">> = ({ ...props }) => {
    return (
        <input
            className="rugs-input"
            {...props}
        />
    )
}