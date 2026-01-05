"use client";

import { Menu as MenuIcon, User } from "lucide-react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuHeader,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from "../ui/menu";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  return (
    <Menu>
      <MenuTrigger className="flex items-center gap-3 border border-border rounded-full py-1.5 pl-3 pr-1.5 hover:shadow-md transition-shadow">
        <MenuIcon size={16} className="text-foreground" />
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-muted-foreground rounded-full flex items-center justify-center">
            <User size={16} className="text-background" />
          </div>
        )}
      </MenuTrigger>

      <MenuContent>
        <MenuHeader>
          <div className="flex items-center gap-3">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <User size={18} className="text-primary-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        </MenuHeader>

        <MenuGroup>
          <MenuItem href="/dashboard">Dashboard</MenuItem>
          <MenuItem href="/dashboard/spots">My spots</MenuItem>
          <MenuItem href="/dashboard/bookings">My bookings</MenuItem>
        </MenuGroup>

        <MenuSeparator />

        <MenuGroup>
          <MenuItem href="/host">List your spot</MenuItem>
          <MenuItem href="/settings">Settings</MenuItem>
        </MenuGroup>

        <MenuSeparator />

        <MenuGroup>
          <MenuItem onClick={() => signOut({ callbackUrl: "/" })}>
            Log out
          </MenuItem>
        </MenuGroup>
      </MenuContent>
    </Menu>
  );
}
