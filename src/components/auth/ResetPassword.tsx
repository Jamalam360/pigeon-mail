import { useState } from "preact/hooks";
import { supabase } from "../../supabase/supabase";
import Button from "../shared/Button";
import Input from "../shared/Input";

export default function ConfirmEmail() {
  const [status, setStatus] = useState({
    error: null as string | null,
    loading: false,
  });
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const hash = window.location.hash.slice(1);

  if (hash.startsWith("access_token")) {
    localStorage.setItem("resetPasswordData", hash);
  }

  console.log(`a ${hash}`);

  const handleReset = async (e: Event) => {
    e.preventDefault();

    const sp = new URLSearchParams(
      localStorage.getItem("resetPasswordData") as string
    );
    localStorage.removeItem("resetPasswordData");
    const token = sp.get("access_token");
    const refreshToken = sp.get("refresh_token");

    if (token == null || refreshToken == null) {
      setStatus({
        error: "Invalid link",
        loading: false,
      });
      return;
    }

    if (password !== passwordConfirmation) {
      setStatus({
        error: "Passwords do not match",
        loading: false,
      });
      return;
    }

    const { error } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: refreshToken,
    });

    if (error != null) {
      setStatus({
        error: "Invalid link",
        loading: false,
      });
      return;
    }

    const { error: resetError } = await supabase.auth.updateUser({
      password,
    });

    if (resetError != null) {
      setStatus({
        error: resetError.message,
        loading: false,
      });
      return;
    }

    await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        access_token: token,
        refresh_token: refreshToken,
      }),
    });

    window.location.href = "/";
  };

  return (
    <div class="w-full flex flex-col items-center justify-center">
      <h1 class="text-3xl text-center pb-4">Reset Password</h1>
      <form onSubmit={handleReset} class="w-4/5 md:w-1/2 space-y-2">
        <Input
          disabled={status.loading}
          required={true}
          id="password"
          value={password}
          updater={setPassword}
          label="New Password"
          type="password"
        />
        <Input
          disabled={status.loading}
          required={true}
          id="password-confirmation"
          value={passwordConfirmation}
          updater={setPasswordConfirmation}
          label="Confirm New Password"
          type="password"
        />
        <div class="pt-3 relative flex flex-col space-y-2">
          <Button action="primary" loading={status.loading} type="submit">
            Reset Password
          </Button>
          {status.error !== "" && (
            <p class="text-sm text-red-400">{status.error}</p>
          )}
        </div>
      </form>
    </div>
  );
}
