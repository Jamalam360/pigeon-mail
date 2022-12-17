import { useState } from "preact/hooks";
import { supabase } from "../../supabase/supabase";
import Link from "../shared/Link";
import Button from "../shared/Button";
import Input from "../shared/Input";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({
    error: "",
    isLoading: false,
  });

  console.log(password);

  const handleLogin = async (e: Event) => {
    e.preventDefault();
    console.log(password);

    setStatus({ error: "", isLoading: true });

    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    const res = await fetch("/api/login", {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
      body: JSON.stringify({
        access_token: data.session?.access_token,
        expires_in: data.session?.expires_in,
        refresh_token: data.session?.refresh_token,
      }),
    });

    if (!res.ok || error != null) {
      setStatus(() => ({
        error: error?.message ?? "Failed to login",
        success: false,
        isLoading: false,
      }));
    } else {
      setStatus({ error: "", isLoading: false });
      window.location.href = "/";
    }
  };

  return (
    <div class="w-full flex flex-col items-center justify-center">
      <h1 class="text-3xl text-center pb-4">Login</h1>
      <form onSubmit={handleLogin} class="w-4/5 md:w-1/2 space-y-2">
        <Input
          disabled={status.isLoading}
          required={true}
          id="email"
          placeholder="johndoe@gmail.com"
          value={email}
          updater={setEmail}
          label="Email"
          type="email"
        />
        <Input
          disabled={status.isLoading}
          required={true}
          id="password"
          value={password}
          updater={setPassword}
          label="Password"
          type="password"
        />
        <div class="pt-3 relative flex flex-col space-y-2">
          <Button action="primary" loading={status.isLoading} type="submit">
            Login
          </Button>
          {status.error !== "" && (
            <div class="text-sm text-red-400">{status.error}</div>
          )}
          <Link href="/auth/register">Don't have an account?</Link>
        </div>
      </form>
    </div>
  );
}
