"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Sparkles,
  X,
} from "lucide-react"
import {
  generateCodes,
  createCustomCode,
  deleteCode,
  bulkDeleteCodes,
  deleteAllUsedCodes,
  toggleUserStatus,
} from "@/app/admin/actions"
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
type CodeFilter = "all" | "available" | "used"

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
  const [activeTab, setActiveTab] = useState<Tab>("codes")
  const [generating, setGenerating] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "stats", label: "الإحصائيات", icon: <BarChart3 className="h-4 w-4" /> },
    {
      id: "codes",
      label: "أكواد التفعيل",
      icon: <KeyRound className="h-4 w-4" />,
      count: codes.length,
    },
    {
      id: "users",
      label: "المستخدمين",
      icon: <Users className="h-4 w-4" />,
      count: profiles.length,
    },
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold text-card-foreground">{"لوحة التحكم"}</h1>
            <p className="text-[11px] text-muted-foreground hidden sm:block">{"إدارة الأكواد والمستخدمين"}</p>
          </div>
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
            {tab.count !== undefined && (
              <span
                className={`text-[10px] rounded-full px-1.5 py-0.5 ${
                  activeTab === tab.id
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 p-4 sm:p-6">
        {activeTab === "stats" && <StatsTab stats={stats} />}
        {activeTab === "codes" && (
          <CodesTab
            codes={codes}
            profiles={profiles}
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

/* ─── Stats Tab ─── */

function StatsTab({ stats }: { stats: Stats }) {
  const cards = [
    {
      label: "إجمالي المستخدمين",
      value: stats.totalUsers,
      icon: <Users className="h-5 w-5" />,
      color: "text-primary bg-primary/10",
    },
    {
      label: "المستخدمين النشطين",
      value: stats.activeUsers,
      icon: <UserCheck className="h-5 w-5" />,
      color: "text-emerald-400 bg-emerald-400/10",
    },
    {
      label: "إجمالي الأكواد",
      value: stats.totalCodes,
      icon: <KeyRound className="h-5 w-5" />,
      color: "text-primary bg-primary/10",
    },
    {
      label: "أكواد مستخدمة",
      value: stats.usedCodes,
      icon: <Check className="h-5 w-5" />,
      color: "text-amber-400 bg-amber-400/10",
    },
    {
      label: "أكواد متاحة",
      value: stats.unusedCodes,
      icon: <Sparkles className="h-5 w-5" />,
      color: "text-emerald-400 bg-emerald-400/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.label} className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-5">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.color}`}
            >
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

/* ─── Codes Tab (Activation Code Tool) ─── */

function CodesTab({
  codes,
  profiles,
  generating,
  copiedCode,
  onGenerate,
  onDelete,
  onCopy,
  onCopyAll,
}: {
  codes: ActivationCode[]
  profiles: Profile[]
  generating: boolean
  copiedCode: string | null
  onGenerate: (count: number) => void
  onDelete: (id: string) => void
  onCopy: (code: string) => void
  onCopyAll: () => void
}) {
  const [customCode, setCustomCode] = useState("")
  const [customLoading, setCustomLoading] = useState(false)
  const [customError, setCustomError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<CodeFilter>("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [showConfirmDeleteUsed, setShowConfirmDeleteUsed] = useState(false)

  // Lookup map for used_by -> profile display name
  const profileMap = useMemo(() => {
    const map = new Map<string, string>()
    profiles.forEach((p) => {
      map.set(p.id, p.display_name ?? "بدون اسم")
    })
    return map
  }, [profiles])

  const filteredCodes = useMemo(() => {
    let result = codes
    if (filter === "available") result = result.filter((c) => !c.is_used)
    if (filter === "used") result = result.filter((c) => c.is_used)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toUpperCase()
      result = result.filter(
        (c) =>
          c.code.toUpperCase().includes(q) ||
          (c.used_by && profileMap.get(c.used_by)?.includes(searchQuery.trim()))
      )
    }
    return result
  }, [codes, filter, searchQuery, profileMap])

  const availableCount = codes.filter((c) => !c.is_used).length
  const usedCount = codes.filter((c) => c.is_used).length

  async function handleCreateCustom() {
    if (!customCode.trim()) return
    setCustomLoading(true)
    setCustomError(null)
    const result = await createCustomCode(customCode)
    if (!result.success) {
      setCustomError(result.error ?? "حدث خطأ")
    } else {
      setCustomCode("")
    }
    setCustomLoading(false)
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAllFiltered() {
    const unusedFiltered = filteredCodes.filter((c) => !c.is_used)
    if (unusedFiltered.every((c) => selectedIds.has(c.id))) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(unusedFiltered.map((c) => c.id)))
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return
    setBulkDeleting(true)
    await bulkDeleteCodes(Array.from(selectedIds))
    setSelectedIds(new Set())
    setBulkDeleting(false)
  }

  async function handleDeleteAllUsed() {
    setBulkDeleting(true)
    await deleteAllUsedCodes()
    setShowConfirmDeleteUsed(false)
    setBulkDeleting(false)
  }

  const filterButtons: { id: CodeFilter; label: string; count: number }[] = [
    { id: "all", label: "الكل", count: codes.length },
    { id: "available", label: "متاح", count: availableCount },
    { id: "used", label: "مستخدم", count: usedCount },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Create Codes Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Auto Generate */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-card-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              {"إنشاء أكواد عشوائية"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {[1, 5, 10, 25, 50].map((count) => (
              <Button
                key={count}
                variant="outline"
                size="sm"
                disabled={generating}
                onClick={() => onGenerate(count)}
                className="gap-1.5 border-border text-card-foreground hover:bg-accent text-xs"
              >
                {generating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                {count}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Custom Code */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-card-foreground">
              <KeyRound className="h-4 w-4 text-primary" />
              {"إنشاء كود مخصص"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  value={customCode}
                  onChange={(e) => {
                    setCustomCode(e.target.value.toUpperCase())
                    setCustomError(null)
                  }}
                  placeholder="أدخل الكود المخصص..."
                  dir="ltr"
                  className="bg-input text-foreground font-mono tracking-widest text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateCustom()
                  }}
                />
              </div>
              <Button
                onClick={handleCreateCustom}
                disabled={customLoading || !customCode.trim()}
                size="sm"
                className="gap-1.5 shrink-0"
              >
                {customLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                {"إنشاء"}
              </Button>
            </div>
            {customError && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {customError}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Codes List */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-sm text-card-foreground">
              {"قائمة الأكواد"}
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 sm:w-48 sm:flex-none">
                <Search className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث..."
                  className="bg-input text-foreground pr-8 text-xs h-8"
                />
              </div>
              {/* Copy all */}
              <Button
                variant="outline"
                size="sm"
                onClick={onCopyAll}
                disabled={availableCount === 0}
                className="gap-1.5 border-border text-card-foreground hover:bg-accent text-xs h-8 hidden sm:flex"
              >
                {copiedCode === "all" ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {"نسخ المتاح"}
              </Button>
            </div>
          </div>

          {/* Filters & Bulk Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            {filterButtons.map((fb) => (
              <button
                key={fb.id}
                onClick={() => setFilter(fb.id)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  filter === fb.id
                    ? "bg-primary/15 text-primary"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {fb.label}
                <span className="mr-1 opacity-70">{fb.count}</span>
              </button>
            ))}

            <div className="mr-auto flex items-center gap-2">
              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="gap-1.5 text-xs h-7"
                >
                  {bulkDeleting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                  {`حذف (${selectedIds.size})`}
                </Button>
              )}
              {usedCount > 0 && (
                <>
                  {showConfirmDeleteUsed ? (
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteAllUsed}
                        disabled={bulkDeleting}
                        className="text-xs h-7"
                      >
                        {bulkDeleting ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "تأكيد"
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfirmDeleteUsed(false)}
                        className="text-xs h-7 text-muted-foreground"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConfirmDeleteUsed(true)}
                      className="gap-1.5 text-xs h-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                      {"حذف المستخدمة"}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-3">
                <KeyRound className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {codes.length === 0
                  ? "لا توجد أكواد بعد. أنشئ أكواد جديدة من الأعلى."
                  : "لا توجد نتائج مطابقة للبحث."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {/* Select all */}
              {filteredCodes.some((c) => !c.is_used) && (
                <button
                  onClick={selectAllFiltered}
                  className="mb-1 text-[11px] text-muted-foreground hover:text-foreground self-start transition-colors"
                >
                  {filteredCodes
                    .filter((c) => !c.is_used)
                    .every((c) => selectedIds.has(c.id))
                    ? "إلغاء تحديد الكل"
                    : "تحديد الكل المتاح"}
                </button>
              )}
              {filteredCodes.map((code) => (
                <div
                  key={code.id}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                    selectedIds.has(code.id)
                      ? "border-primary/40 bg-primary/5"
                      : "border-border bg-accent/20"
                  }`}
                >
                  {/* Selection checkbox for unused codes */}
                  {!code.is_used ? (
                    <button
                      onClick={() => toggleSelect(code.id)}
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                        selectedIds.has(code.id)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/40 hover:border-primary"
                      }`}
                      aria-label="تحديد"
                    >
                      {selectedIds.has(code.id) && <Check className="h-2.5 w-2.5" />}
                    </button>
                  ) : (
                    <div className="w-4 shrink-0" />
                  )}

                  {/* Code */}
                  <code className="font-mono text-sm font-semibold text-foreground tracking-wider flex-1 min-w-0 truncate">
                    {code.code}
                  </code>

                  {/* Used by info */}
                  {code.is_used && code.used_by && (
                    <span className="text-[10px] text-muted-foreground hidden md:block shrink-0 max-w-32 truncate">
                      {profileMap.get(code.used_by) ?? "مستخدم محذوف"}
                    </span>
                  )}

                  {/* Status */}
                  <Badge
                    variant={code.is_used ? "secondary" : "default"}
                    className={`text-[10px] shrink-0 ${
                      code.is_used
                        ? "bg-muted text-muted-foreground"
                        : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    }`}
                  >
                    {code.is_used ? "مستخدم" : "متاح"}
                  </Badge>

                  {/* Date */}
                  <span className="text-[10px] text-muted-foreground hidden sm:block shrink-0 tabular-nums">
                    {new Date(code.created_at).toLocaleDateString("ar", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onCopy(code.code)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      aria-label="نسخ الكود"
                    >
                      {copiedCode === code.code ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
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

/* ─── Users Tab ─── */

function UsersTab({
  profiles,
  onToggle,
}: {
  profiles: Profile[]
  onToggle: (userId: string, isActive: boolean) => void
}) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) return profiles
    const q = searchQuery.trim().toLowerCase()
    return profiles.filter(
      (p) => p.display_name?.toLowerCase().includes(q) || p.id.includes(q)
    )
  }, [profiles, searchQuery])

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-sm text-card-foreground">
            {`المستخدمين (${profiles.length})`}
          </CardTitle>
          <div className="relative sm:w-48">
            <Search className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث..."
              className="bg-input text-foreground pr-8 text-xs h-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredProfiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-3">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {profiles.length === 0
                ? "لا يوجد مستخدمين مسجلين بعد."
                : "لا توجد نتائج مطابقة."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredProfiles.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-accent/20 px-3 py-2.5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {(profile.display_name ?? "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {profile.display_name ?? "بدون اسم"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(profile.created_at).toLocaleDateString("ar", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
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
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
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
