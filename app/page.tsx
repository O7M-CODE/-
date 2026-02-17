import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LineGenerator } from "@/components/line-generator"
import { signout } from "@/app/auth/actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldAlert, LogOut } from "lucide-react"

export default async function Page() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user account is active
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_active, is_admin")
    .eq("id", user.id)
    .single()

  // If account is not active and not admin, show pending message
  if (!profile?.is_active && !profile?.is_admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border bg-card shadow-lg text-center">
          <CardHeader>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <CardTitle className="text-xl font-bold text-card-foreground mt-4">
              {"الحساب قيد المراجعة"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {"حسابك لم يتم تفعيله بعد من قبل المسؤول. يرجى الانتظار حتى يتم تفعيل حسابك."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={signout}>
              <Button
                variant="outline"
                className="gap-2 border-border text-card-foreground hover:bg-accent"
              >
                <LogOut className="h-4 w-4" />
                {"تسجيل الخروج"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <LineGenerator isAdmin={profile?.is_admin ?? false} userEmail={user.email ?? ""} />
}
