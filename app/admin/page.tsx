import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check admin status
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!profile?.is_admin) {
    redirect("/")
  }

  // Fetch all data for dashboard
  const [codesResult, profilesResult] = await Promise.all([
    supabase
      .from("activation_codes")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false }),
  ])

  const codes = codesResult.data ?? []
  const profiles = profilesResult.data ?? []

  const stats = {
    totalUsers: profiles.length,
    activeUsers: profiles.filter((p) => p.is_active).length,
    totalCodes: codes.length,
    usedCodes: codes.filter((c) => c.is_used).length,
    unusedCodes: codes.filter((c) => !c.is_used).length,
  }

  return (
    <AdminDashboard
      codes={codes}
      profiles={profiles}
      stats={stats}
      userEmail={user.email ?? ""}
    />
  )
}
