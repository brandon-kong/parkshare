import Link from "next/link";
import { Typography } from "../ui/typography";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-lg">P</span>
      </div>
      <Typography variant="h4" className="hidden sm:block">
        parkkit
      </Typography>
    </Link>
  );
}
