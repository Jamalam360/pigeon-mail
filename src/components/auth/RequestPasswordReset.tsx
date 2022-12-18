import { useState } from "preact/hooks";
import { supabase } from "../../supabase/supabase";
import Button from "../shared/Button";
import Input from "../shared/Input";

export default function RequestPasswordReset() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({
    error: "",
    success: false,
    loading: false,
  });

  const handleLogin = async (e: Event) => {
    e.preventDefault();

    setStatus({ error: "", loading: true, success: false });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/auth/reset-password",
    });

    if (error != null) {
      setStatus({
        error: error.message,
        loading: false,
        success: false,
      });
    } else {
      setStatus({
        error: "",
        loading: false,
        success: true,
      });
    }
  };

  return (
    <div class="w-full flex flex-col items-center justify-center">
      <h1 class="text-3xl text-center pb-4">Reset Password</h1>
      <form onSubmit={handleLogin} class="w-4/5 md:w-1/2 space-y-2">
        <Input
          disabled={status.loading}
          required={true}
          id="email"
          placeholder="johndoe@gmail.com"
          value={email}
          updater={setEmail}
          label="Email"
          type="email"
        />
        <div class="pt-3 relative flex flex-col space-y-2">
          <Button action="primary" loading={status.loading} type="submit">
            Reset Password
          </Button>
          {status.error !== "" && (
            <p class="text-sm text-red-400">{status.error}</p>
          )}
          {status.success && (
            <p class="text-sm">
              Please check your email for a password reset link.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
