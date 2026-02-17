"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

function generateCode(length: number = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("غير مصرح")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!profile?.is_admin) {
    throw new Error("غير مصرح - ليس أدمن")
  }

  return { supabase, user }
}

export async function generateCodes(count: number) {
  const { supabase, user } = await requireAdmin()

  const codes = []
  for (let i = 0; i < count; i++) {
    codes.push({
      code: generateCode(),
      created_by: user.id,
      is_used: false,
    })
  }

  const { error } = await supabase.from("activation_codes").insert(codes)

  if (error) {
    return { success: false, error: "فشل في إنشاء الأكواد" }
  }

  revalidatePath("/admin")
  return { success: true }
}

export async function deleteCode(codeId: string) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from("activation_codes")
    .delete()
    .eq("id", codeId)

  if (error) {
    return { success: false, error: "فشل في حذف الكود" }
  }

  revalidatePath("/admin")
  return { success: true }
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", userId)

  if (error) {
    return { success: false, error: "فشل في تحديث حالة المستخدم" }
  }

  revalidatePath("/admin")
  return { success: true }
}
