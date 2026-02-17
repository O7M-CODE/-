import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const email = "osamashhadame@gmail.com";
  const password = "17901790Oo@";

  // Create user via admin API (proper password hashing)
  const { data: user, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: "Admin" },
    });

  if (createError) {
    console.error("Error creating user:", createError.message);
    process.exit(1);
  }

  console.log("User created:", user.user.id);

  // Set profile as admin + active
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ is_admin: true, is_active: true })
    .eq("id", user.user.id);

  if (profileError) {
    console.error("Error updating profile:", profileError.message);
    process.exit(1);
  }

  console.log("Admin profile set successfully!");
  console.log(`Email: ${email}`);
  console.log("is_admin: true, is_active: true");
}

main();
