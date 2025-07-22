import type { FC } from "react";
import "./header.css";
import type { User } from "../../api/user";

interface HeaderProps {
    user: User | null;
}

export const Header: FC<HeaderProps> = ({ user }) => {
    return (
        <div className="header">
            {
                user === null ? (
                    <div className="profile-card">
                        No profile added
                    </div>
                ) : (
                    <div className="profile-card">
                        <div className="username">
                            {user.name}
                        </div>
                        <div className="balance">
                            {user.coins} Coins
                        </div>
                    </div>
                )
            }
        </div>
    )
}