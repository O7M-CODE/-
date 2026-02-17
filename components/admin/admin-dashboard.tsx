"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  KeyRound,
  BarChart3,
  Plus,
  Trash2,
  Copy,
  Check,
  LogOut,
  Shield,
  UserCheck,
  UserX,
} from "lucide-react"
import { generateCodes, deleteCode, toggleUserStatus } from "@/app/admin/actions"
import { signout } from "@/app/auth/actions"

type ActivationCode = {
  id: string
  code: string
  is_used: boolean
  used_by: string | null
  created_at: string
  used_at: string | null
}

type Profile = {
  id: string
  display_name: string | null
  is_admin: boolean
  is_active: boolean
  created_at: string
}

type Stats = {
  totalUsers: number
  activeUsers: number
  totalCodes: number
  usedCodes: number
  unusedCodes: number
}

type Tab = "stats" | "codes" | "users"

export function AdminDashboard({
  codes,
  profiles,
  stats,
  userEmail,
}: {
  codes: ActivationCode[]
  profiles: Profile[]
  stats: Stats
  userEmail: string
}) {
  const [activeTab, setActiveTab] = useState<Tab>("stats")
  const [generating, setGenerating] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "stats", label: "الإحصائيات", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "codes", label: "أكواد التفعيل", icon: <KeyRound className="h-4 w-4" /> },
    { id: "users", label: "المستخدمين", icon: <Users className="h-4 w-4" /> },
  ]

  async function handleGenerateCodes(count: number) {
    setGenerating(true)
    await generateCodes(count)
    setGenerating(false)
  }

  async function handleDeleteCode(codeId: string) {
    await deleteCode(codeId)
  }

  async function handleToggleUser(userId: string, isActive: boolean) {
    await toggleUserStatus(userId, isActive)
  }

  function handleCopyCode(code: string) {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  function handleCopyAllUnused() {
    const unusedCodes = codes
      .filter((c) => !c.is_used)
      .map((c) => c.code)
      .join("\n")
    navigator.clipboard.writeText(unusedCodes)
    setCopiedCode("all")
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold text-card-foreground">{"لوحة التحكم"}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:block">{userEmail}</span>
          <form action={signout}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{"خروج"}</span>
            </Button>
          </form>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="flex border-b border-border bg-card px-4 sm:px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 p-4 sm:p-6">
        {activeTab === "stats" && <StatsTab stats={stats} />}
        {activeTab === "codes" && (
          <CodesTab
            codes={codes}
            generating={generating}
            copiedCode={copiedCode}
            onGenerate={handleGenerateCodes}
            onDelete={handleDeleteCode}
            onCopy={handleCopyCode}
            onCopyAll={handleCopyAllUnused}
          />
        )}
        {activeTab === "users" && (
          <UsersTab profiles={profiles} onToggle={handleToggleUser} />
        )}
      </main>
    </div>
  )
}

function StatsTab({ stats }: { stats: Stats }) {
  const cards = [
    {
      label: "إجمالي المستخدمين",
      value: stats.totalUsers,
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "المستخدمين النشطين",
      value: stats.activeUsers,
      icon: <UserCheck className="h-5 w-5" />,
    },
    {
      label: "إجمالي الأكواد",
      value: stats.totalCodes,
      icon: <KeyRound className="h-5 w-5" />,
    },
    {
      label: "أكواد مستخدمة",
      value: stats.usedCodes,
      icon: <Check className="h-5 w-5" />,
    },
    {
      label: "أكواد متاحة",
      value: stats.unusedCodes,
      icon: <Plus className="h-5 w-5" />,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.label} className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {card.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function CodesTab({
  codes,
  generating,
  copiedCode,
  onGenerate,
  onDelete,
  onCopy,
  onCopyAll,
}: {
  codes: ActivationCode[]
  generating: boolean
  copiedCode: string | null
  onGenerate: (count: number) => void
  onDelete: (id: string) => void
  onCopy: (code: string) => void
  onCopyAll: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Actions */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-card-foreground">
            {"إنشاء أكواد جديدة"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {[1, 5, 10, 25].map((count) => (
            <Button
              key={count}
              variant="outline"
              size="sm"
              disabled={generating}
              onClick={() => onGenerate(count)}
              className="gap-1.5 border-border text-card-foreground hover:bg-accent text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              {`إنشاء ${count}`}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={onCopyAll}
            disabled={codes.filter((c) => !c.is_used).length === 0}
            className="gap-1.5 border-border text-card-foreground hover:bg-accent text-xs mr-auto"
          >
            {copiedCode === "all" ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {"نسخ الكل المتاح"}
          </Button>
        </CardContent>
      </Card>

      {/* Codes List */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-card-foreground">
            {`الأكواد (${codes.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {codes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {"لا توجد أكواد بعد. أنشئ أكواد جديدة من الأعلى."}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {codes.map((code) => (
                <div
                  key={code.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-accent/20 px-3 py-2"
                >
                  <code className="font-mono text-sm font-semibold text-foreground tracking-wider flex-1">
                    {code.code}
                  </code>
                  <Badge
                    variant={code.is_used ? "secondary" : "default"}
                    className={`text-[10px] shrink-0 ${
                      code.is_used
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/15 text-primary border-primary/30"
                    }`}
                  >
                    {code.is_used ? "مستخدم" : "متاح"}
                  </Badge>
                  {code.used_at && (
                    <span className="text-[10px] text-muted-foreground hidden sm:block shrink-0">
                      {new Date(code.used_at).toLocaleDateString("ar")}
                    </span>
                  )}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onCopy(code.code)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      aria-label="نسخ الكود"
                    >
                      {copiedCode === code.code ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    {!code.is_used && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(code.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        aria-label="حذف الكود"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function UsersTab({
  profiles,
  onToggle,
}: {
  profiles: Profile[]
  onToggle: (userId: string, isActive: boolean) => void
}) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-card-foreground">
          {`المستخدمين (${profiles.length})`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {profiles.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {"لا يوجد مستخدمين مسجلين بعد."}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-accent/20 px-3 py-2"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {(profile.display_name ?? "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {profile.display_name ?? "بدون اسم"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(profile.created_at).toLocaleDateString("ar")}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {profile.is_admin && (
                    <Badge className="text-[10px] bg-primary/15 text-primary border-primary/30">
                      {"أدمن"}
                    </Badge>
                  )}
                  <Badge
                    className={`text-[10px] ${
                      profile.is_active
                        ? "bg-green-500/15 text-green-400 border-green-500/30"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {profile.is_active ? "نشط" : "معطل"}
                  </Badge>
                  {!profile.is_admin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggle(profile.id, !profile.is_active)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      aria-label={profile.is_active ? "تعطيل المستخدم" : "تفعيل المستخدم"}
                    >
                      {profile.is_active ? (
                        <UserX className="h-3.5 w-3.5" />
                      ) : (
                        <UserCheck className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
