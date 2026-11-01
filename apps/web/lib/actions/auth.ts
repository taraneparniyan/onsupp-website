"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";

export type State = {
  error?: string;
} | undefined;

const loginSchema = z.object({
  email: z.string().email("ایمیل نامعتبر است"),
  password: z.string().min(1, "رمز عبور الزامی است"),
});

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function login(state: State, formData: FormData): Promise<State> {
  const validated = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validated.data),
      cache: "no-store",
    });

    const data: { token?: string; error?: string } = await res.json().catch(() => ({}));

    if (!res.ok || !data.token) {
      const errorMsg =
        data.error === "Invalid email or password"
          ? "ایمیل یا رمز عبور اشتباه است"
          : data.error || "ورود ناموفق";
      return { error: errorMsg };
    }

    const cookieStore = await cookies();
    cookieStore.set("token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest: unknown }).digest === "string" &&
      (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }
    return { error: "خطا در ارتباط با سرور" };
  }

  redirect("/admin");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/admin/login");
}
