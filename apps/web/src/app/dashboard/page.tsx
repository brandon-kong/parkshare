import SignOutButton from "@/components/auth/sign-out-button";
import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation";

export default async function Dashboard()
{
    const session = await auth();

    if (!session)
    {
        redirect("/auth/login");
    }

    return (
        <div>
            Welcome, { session.user.id }
            <SignOutButton />
        </div>
    )
}