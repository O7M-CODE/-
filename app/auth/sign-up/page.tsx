import { signup } from "@/app/auth/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle, Sparkles } from "lucide-react"

export default async function SignUpPage(props: {
  searchParams: Promise<{ error?: string }>
}) {
  const searchParams = await props.searchParams
  const error = searchParams.error

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-md flex-col gap-4">
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center" dir="rtl">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-semibold">{"استعمل الكود للوصول إلى الأداة"}</span>
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="mt-2 inline-block rounded-md bg-primary px-4 py-1.5 font-mono text-lg font-bold tracking-widest text-primary-foreground">
            FLASH26
          </div>
        </div>
      <Card className="w-full border-border bg-card shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-card-foreground">
            {"إنشاء حساب جديد"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {"أدخل بياناتك وكود التفعيل للتسجيل"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{decodeURIComponent(error)}</span>
            </div>
          )}
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-card-foreground">
                {"البريد الإلكتروني"}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                required
                dir="ltr"
                className="bg-input text-foreground"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-card-foreground">
                {"كلمة المرور"}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="6 أحرف على الأقل"
                required
                minLength={6}
                dir="ltr"
                className="bg-input text-foreground"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="activation_code" className="text-card-foreground">
                {"كود التفعيل"}
              </Label>
              <Input
                id="activation_code"
                name="activation_code"
                type="text"
                placeholder="أدخل كود التفعيل"
                required
                dir="ltr"
                className="bg-input text-foreground font-mono tracking-widest"
              />
            </div>
            <Button
              formAction={signup}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {"تسجيل"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {"لديك حساب؟ "}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:underline"
            >
              {"تسجيل الدخول"}
            </Link>
          </p>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
