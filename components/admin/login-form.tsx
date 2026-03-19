"use client";

import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const REMEMBER_KEY = "admin-login-remember-v1";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [isResetPending, setIsResetPending] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [databaseUnavailable, setDatabaseUnavailable] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(REMEMBER_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as { email?: string; password?: string };
      setEmail(parsed.email || "");
      setPassword(parsed.password || "");
      setRememberMe(Boolean(parsed.email || parsed.password));
    } catch {
      localStorage.removeItem(REMEMBER_KEY);
    }
  }, []);

  useEffect(() => {
    let canceled = false;

    async function checkHealth() {
      try {
        const response = await fetch("/api/health?db=true", { cache: "no-store" });
        const payload = (await response.json()) as { checks?: { database?: string } };
        if (canceled) return;
        setDatabaseUnavailable(payload?.checks?.database === "error");
      } catch {
        if (!canceled) setDatabaseUnavailable(true);
      }
    }

    void checkHealth();

    return () => {
      canceled = true;
    };
  }, []);

  const onSubmit = () => {
    setError("");
    setStatus("");

    const normalizedEmail = email.trim();
    const normalizedPassword = password.trim();

    startTransition(async () => {
      let result:
        | {
            error?: string | null;
            ok?: boolean;
            status?: number;
            url?: string | null;
          }
        | undefined;

      try {
        result = await signIn("credentials", {
          email: normalizedEmail,
          password: normalizedPassword,
          redirect: false,
          callbackUrl: "/admin",
        });
      } catch {
        setError("Máy chủ xác thực đang lỗi. Vui lòng thử lại sau vài giây.");
        return;
      }

      if (result?.ok) {
        if (rememberMe) {
          localStorage.setItem(
            REMEMBER_KEY,
            JSON.stringify({ email: normalizedEmail, password: normalizedPassword }),
          );
        } else {
          localStorage.removeItem(REMEMBER_KEY);
        }
        router.push("/admin");
        router.refresh();
        return;
      }

      if (result?.error === "AuthServerError") {
        setError("Máy chủ xác thực đang lỗi. Kiểm tra NEXTAUTH_URL/NEXTAUTH_SECRET và xem log runtime.");
        return;
      }

      try {
        const health = await fetch("/api/health?db=true", { cache: "no-store" }).then((response) =>
          response.json(),
        );
        if (health?.checks?.database === "error") {
          setDatabaseUnavailable(true);
          setError("Không kết nối được cơ sở dữ liệu. Vui lòng kiểm tra biến môi trường DB trên Hostinger.");
          return;
        }
      } catch {
        setDatabaseUnavailable(true);
      }

      setError("Invalid email or password.");
    });
  };

  const onResetPassword = async () => {
    setError("");
    setStatus("");

    const normalizedEmail = resetEmail.trim();
    const normalizedPassword = resetPassword.trim();

    if (!normalizedEmail) {
      setError("Vui lòng nhập email để reset password.");
      return;
    }
    if (normalizedPassword.length < 8) {
      setError("Mật khẩu mới cần ít nhất 8 ký tự.");
      return;
    }
    if (normalizedPassword !== resetConfirm.trim()) {
      setError("Xác nhận mật khẩu chưa khớp.");
      return;
    }

    setIsResetPending(true);
    try {
      const response = await fetch("/api/admin/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          password: normalizedPassword,
        }),
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !payload.ok) {
        setError(payload.error || "Không reset được mật khẩu.");
        return;
      }

      setEmail(normalizedEmail);
      setPassword(normalizedPassword);
      setShowForgotPassword(false);
      setStatus("Đã reset mật khẩu thành công. Bạn có thể đăng nhập ngay.");
    } catch {
      setError("Không thể reset mật khẩu lúc này.");
    } finally {
      setIsResetPending(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-stone-200">
      <CardHeader>
        <CardTitle className="text-2xl">ĐẠI THIÊN PHÚ WOOD Admin</CardTitle>
        <CardDescription>
          Sign in to manage products, categories, homepage sections, and brand settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="pr-11"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-stone-500 hover:text-stone-800"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-sm">
            <label className="inline-flex items-center gap-2 text-stone-700">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="size-4 rounded border-stone-300"
              />
              Remember password
            </label>
            <button
              type="button"
              className="font-medium text-amber-800 hover:text-amber-900"
              onClick={() => setShowForgotPassword((previous) => !previous)}
            >
              Quên mật khẩu?
            </button>
          </div>

          {databaseUnavailable ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Database đang lỗi kết nối. Nếu pass đúng vẫn không login được, kiểm tra lại biến DB trên Hostinger.
            </p>
          ) : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {status ? <p className="text-sm text-emerald-700">{status}</p> : null}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        {showForgotPassword ? (
          <div className="mt-4 space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-3">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-stone-800">
              <KeyRound className="size-4" />
              Reset password
            </p>
            <div className="space-y-2">
              <Label htmlFor="resetEmail">Admin email</Label>
              <Input
                id="resetEmail"
                type="email"
                value={resetEmail}
                onChange={(event) => setResetEmail(event.target.value)}
                placeholder="maithihongsang79@gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resetPassword">New password</Label>
              <Input
                id="resetPassword"
                type="text"
                value={resetPassword}
                onChange={(event) => setResetPassword(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resetConfirm">Confirm new password</Label>
              <Input
                id="resetConfirm"
                type="text"
                value={resetConfirm}
                onChange={(event) => setResetConfirm(event.target.value)}
              />
            </div>
            <Button type="button" variant="outline" disabled={isResetPending} onClick={onResetPassword}>
              {isResetPending ? "Resetting..." : "Reset password now"}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
