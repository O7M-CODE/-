import { login } from "@/app/auth/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default async function LoginPage(props: {
  searchParams: Promise<{ error?: string }>
}) {
  const searchParams = await props.searchParams
  const error = searchParams.error

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border bg-card shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-card-foreground">
            {"تسجيل الدخول"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {"أدخل بياناتك للوصول إلى حسابك"}
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
                placeholder="••••••••"
                required
                dir="ltr"
                className="bg-input text-foreground"
              />
            </div>
            <Button
              formAction={login}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {"دخول"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {"ليس لديك حساب؟ "}
            <Link
              href="/auth/sign-up"
              className="font-medium text-primary hover:underline"
            >
              {"إنشاء حساب"}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
