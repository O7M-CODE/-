"use client"

import { useState, useCallback, useMemo, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Check, Copy, Instagram, Trash2, Plus, LogOut, Shield } from "lucide-react"
import Link from "next/link"

type Field = {
  id: string
  label: string
  value: string
  multiline: boolean
}

const defaultFields: Field[] = [
  { id: "code", label: "الكود", value: "", multiline: true },
  { id: "website", label: "الموقع", value: "", multiline: false },
  { id: "video", label: "الفيديو", value: "", multiline: false },
  { id: "snap", label: "كود السناب", value: "", multiline: true },
]

export function LineGenerator({ isAdmin, userEmail }: { isAdmin: boolean; userEmail: string }) {
  const [fields, setFields] = useState<Field[]>(defaultFields)
  const [copied, setCopied] = useState(false)
  const nextIdRef = useRef(1)

  const updateField = useCallback((id: string, key: keyof Field, val: string | boolean) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: val } : f))
    )
  }, [])

  const removeField = useCallback((id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const addField = useCallback((multiline: boolean) => {
    const id = `field-${nextIdRef.current++}`
    setFields((prev) => [
      ...prev,
      { id, label: "", value: "", multiline },
    ])
  }, [])

  const generatedLines = useMemo(() => {
    const multilineFields = fields.filter((f) => f.multiline)
    const allMultiLines = multilineFields.map((f) => f.value.split("\n"))
    const maxLines = allMultiLines.length > 0
      ? Math.max(...allMultiLines.map((lines) => lines.length))
      : 1

    const result: string[] = []
    for (let i = 0; i < maxLines; i++) {
      const parts: string[] = []

      for (const field of fields) {
        if (field.multiline) {
          const lines = field.value.split("\n")
          const val = (lines[i] ?? "").trim()
          if (val && field.label.trim()) {
            parts.push(`${field.label.trim()} : ${val}`)
          }
        } else {
          const val = field.value.trim()
          if (val && field.label.trim()) {
            parts.push(`${field.label.trim()} : ${val}`)
          }
        }
      }

      if (parts.length > 0) {
        result.push(parts.join(" / "))
      }
    }

    return result.join("\n")
  }, [fields])

  const lineCount = useMemo(() => {
    if (!generatedLines.trim()) return 0
    return generatedLines.split("\n").length
  }, [generatedLines])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedLines)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [generatedLines])

  const handleClear = useCallback(() => {
    setFields((prev) => prev.map((f) => ({ ...f, value: "" })))
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-8 gap-6">
      {/* Header */}
      <div className="flex w-full max-w-3xl items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Flash Code</h1>
          <a
            href="https://www.instagram.com/flash1_store"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Instagram flash1_store"
          >
            <Instagram className="h-6 w-6" />
          </a>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:block">{userEmail}</span>
          {isAdmin && (
            <Link href="/admin">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">{"لوحة التحكم"}</span>
              </Button>
            </Link>
          )}
          <form action="/auth/logout" method="post">
            <Button
              variant="ghost"
              size="sm"
              type="submit"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{"خروج"}</span>
            </Button>
          </form>
        </div>
      </div>

      {/* Input Card */}
      <Card className="w-full max-w-3xl border-border bg-card shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-card-foreground">{"ادخال البيانات"}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {" اداة فلاش لتوليد الأكواد للمتاجر "}
          </CardDescription>
          <CardDescription className="text-sm text-muted-foreground">
            {"Version 0.1 "}
          </CardDescription>

        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.id} className="flex flex-col gap-2 rounded-lg border border-border bg-accent/30 p-3">
                {/* Field header with label + trash */}
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground shrink-0">{"الاسم:"}</Label>
                  <input
                    value={field.label}
                    onChange={(e) => updateField(field.id, "label", e.target.value)}
                    placeholder="اسم الحقل"
                    className="h-7 flex-1 rounded-md border border-border bg-input px-2 text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-ring min-w-0"
                    dir="auto"
                  />
                  {!field.multiline && (
                    <span className="text-[10px] text-muted-foreground shrink-0">{"(كل الاسطر)"}</span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeField(field.id)}
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    aria-label="حذف الحقل"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Field input */}
                {field.multiline ? (
                  <textarea
                    placeholder={"ادخل القيم...\nسطر لكل قيمة"}
                    value={field.value}
                    onChange={(e) => updateField(field.id, "value", e.target.value)}
                    rows={4}
                    className="w-full rounded-md border border-border bg-input px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring resize-y leading-relaxed"
                    dir="ltr"
                  />
                ) : (
                  <input
                    placeholder="ادخل القيمة..."
                    value={field.value}
                    onChange={(e) => updateField(field.id, "value", e.target.value)}
                    className="w-full rounded-md border border-border bg-input px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring h-9"
                    dir="ltr"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Add field buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addField(true)}
              className="gap-1.5 border-border text-card-foreground hover:bg-accent hover:text-accent-foreground text-xs h-8"
            >
              <Plus className="h-3.5 w-3.5" />
              {"حقل متعدد الاسطر"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addField(false)}
              className="gap-1.5 border-border text-card-foreground hover:bg-accent hover:text-accent-foreground text-xs h-8"
            >
              <Plus className="h-3.5 w-3.5" />
              {"حقل سطر واحد"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Output Card */}
      <Card className="w-full max-w-3xl border-border bg-card shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-card-foreground">{"النتيجة"}</CardTitle>
            {lineCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {lineCount} {"سطر"}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="relative rounded-md border border-border bg-muted/50 overflow-hidden">
            <textarea
              readOnly
              value={generatedLines}
              rows={Math.max(4, Math.min(15, lineCount))}
              className="w-full bg-transparent px-3 py-3 font-mono text-xs text-foreground leading-relaxed resize-none outline-none whitespace-pre overflow-x-auto"
              dir="ltr"
              style={{ tabSize: 2 }}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleCopy}
              disabled={!generatedLines.trim()}
              className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-sm h-9"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  {"تم النسخ!"}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  {"نسخ الاسطر"}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              className="gap-2 border-border text-card-foreground hover:bg-accent hover:text-accent-foreground text-sm h-9"
            >
              <Trash2 className="h-4 w-4" />
              {"مسح الكل"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
