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

const ADMIN_EMAIL = "osamashhadame@gmail.com";
const ADMIN_PASSWORD = "17901790Oo@";

async function createAdmin() {
  console.log("Creating admin user...");

  // Step 1: Create user via Auth Admin API (auto-confirms email)
  const { data: userData, error: createError } =
    await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: "Admin" },
    });

  if (createError) {
    // If user already exists, try to find them
    if (createError.message.includes("already been registered")) {
      console.log("User already exists, fetching user...");
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existingUser = listData?.users?.find(
        (u) => u.email === ADMIN_EMAIL
      );
      if (existingUser) {
        console.log("Found existing user:", existingUser.id);
        // Update profile to admin
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ is_admin: true, display_name: "Admin" })
          .eq("id", existingUser.id);
        if (updateError) {
          console.error("Error updating profile:", updateError.message);
        } else {
          console.log("Profile updated to admin successfully!");
        }
        return;
      }
    }
    console.error("Error creating user:", createError.message);
    process.exit(1);
  }

  const userId = userData.user.id;
  console.log("User created with ID:", userId);

  // Step 2: Wait a moment for the trigger to create the profile
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Step 3: Update the profile to set is_admin = true
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ is_admin: true, display_name: "Admin" })
    .eq("id", userId);

  if (updateError) {
    console.error("Error updating profile:", updateError.message);
    // Try inserting if update failed (trigger may not have fired)
    const { error: insertError } = await supabase.from("profiles").insert({
      id: userId,
      display_name: "Admin",
      is_admin: true,
      is_active: true,
    });
    if (insertError) {
      console.error("Error inserting profile:", insertError.message);
    } else {
      console.log("Profile inserted as admin successfully!");
    }
  } else {
    console.log("Profile updated to admin successfully!");
  }

  // Step 4: Seed the initial activation code
  const { error: codeError } = await supabase
    .from("activation_codes")
    .upsert(
      { code: "ADMIN2026", is_used: false, created_by: userId },
      { onConflict: "code" }
    );

  if (codeError) {
    console.error("Error seeding activation code:", codeError.message);
  } else {
    console.log('Activation code "ADMIN2026" seeded successfully!');
  }

  console.log("\n--- Admin Setup Complete ---");
  console.log("Email:", ADMIN_EMAIL);
  console.log("Password: [set as provided]");
  console.log("Admin: true");
}

createAdmin().catch(console.error);
