"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    redirect("/auth/login?error=يرجى ملء جميع الحقول")
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent("البريد الإلكتروني أو كلمة المرور غير صحيحة")}`)
  }

  // Check if user account is active
  if (data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_active, is_admin")
      .eq("id", data.user.id)
      .single()

    if (profile && !profile.is_active && !profile.is_admin) {
      await supabase.auth.signOut()
      redirect(`/auth/login?error=${encodeURIComponent("حسابك معطل. تواصل مع المسؤول لتفعيل حسابك.")}`)
    }
  }

  redirect("/")
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const activationCode = formData.get("activation_code") as string

  if (!email || !password || !activationCode) {
    redirect("/auth/sign-up?error=يرجى ملء جميع الحقول")
  }

  if (password.length < 6) {
    redirect("/auth/sign-up?error=كلمة المرور يجب أن تكون 6 أحرف على الأقل")
  }

  // Verify activation code exists and is unused
  const { data: codeData, error: codeError } = await supabase
    .from("activation_codes")
    .select("id, code, is_used")
    .eq("code", activationCode.trim())
    .eq("is_used", false)
    .single()

  if (codeError || !codeData) {
    redirect(`/auth/sign-up?error=${encodeURIComponent("كود التفعيل غير صالح أو مستخدم مسبقاً")}`)
  }

  // Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${process.env.NEXT_PUBLIC_SITE_URL || ""}/`,
      data: {
        display_name: email.split("@")[0],
      },
    },
  })

  if (authError) {
    if (authError.message.includes("already registered")) {
      redirect(`/auth/sign-up?error=${encodeURIComponent("هذا البريد الإلكتروني مسجل مسبقاً")}`)
    }
    redirect(`/auth/sign-up?error=${encodeURIComponent("حدث خطأ أثناء التسجيل")}`)
  }

  // Mark the activation code as used
  if (authData.user) {
    await supabase
      .from("activation_codes")
      .update({
        is_used: true,
        used_by: authData.user.id,
        used_at: new Date().toISOString(),
      })
      .eq("id", codeData.id)
  }

  redirect("/auth/sign-up-success")
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}
