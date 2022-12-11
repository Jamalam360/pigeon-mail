import { useState } from "preact/hooks";
import countries from "../../data/countries_by_name.json";
import { supabase } from "../../supabase/supabase";
import Button from "../shared/Button";
import Dropdown from "../shared/Dropdown";
import Input from "../shared/Input";
import Link from "../shared/Link";
import Spinner from "../shared/Spinner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("Afghanistan");

  const [status, setStatus] = useState({
    error: "",
    isLoading: false,
  });

  const handleRegister = async () => {
    setStatus({ error: "", isLoading: true });

    if (password !== passwordConfirmation) {
      setStatus({
        error: "Passwords do not match",
        isLoading: false,
      });
      return;
    }

    const colors = ["3b434f", "adb4bd", "fdca4d", "666e7a"];

    for (let i = colors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [colors[i], colors[j]] = [colors[j], colors[i]];
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error?.message) {
      setStatus(() => ({
        error: error.message,
        success: false,
        isLoading: false,
      }));
      return;
    }

    const { error: iError } = await supabase.from("users").insert({
      id: data.user.id,
      country,
      name,
      avatar: `https://source.boringavatars.com/beam/120/${name}?colors=${colors.join(
        ","
      )}`,
    });

    if (iError?.message) {
      setStatus(() => ({
        error: iError.message,
        success: false,
        isLoading: false,
      }));
      return;
    }

    await fetch("/api/login", {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
      body: JSON.stringify({
        access_token: data.session?.access_token,
        expires_in: data.session?.expires_in,
        refresh_token: data.session?.refresh_token,
      }),
    });

    setStatus({ error: "", isLoading: false });
    window.location.href = "/";
  };

  return (
    <div class="w-full flex flex-col items-center justify-center">
      <h1 class="text-3xl text-center pb-4">Register</h1>
      <div class="w-2/3 md:w-1/2 space-y-2">
        <Input
          disabled={status.isLoading}
          id="email"
          placeholder="johndoe@gmail.com"
          value={email}
          onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
          label="Email"
          type="email"
        />
        <Input
          disabled={status.isLoading}
          id="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
          label="Password"
          type="password"
        />
        <Input
          disabled={status.isLoading}
          id="confirm-password"
          placeholder="********"
          value={passwordConfirmation}
          onChange={(e) =>
            setPasswordConfirmation((e.target as HTMLInputElement).value)
          }
          label="Confirm password"
          type="password"
        />
        <div class="pt-4" />
        <Input
          disabled={status.isLoading}
          id="name"
          placeholder="James"
          value={name}
          onChange={(e) => setName((e.target as HTMLInputElement).value)}
          label="First Name"
          type="text"
        />
        <Dropdown
          disabled={status.isLoading}
          id="country"
          onChange={(e) => setCountry((e.target as HTMLOptionElement).value)}
          label="Country"
          values={countries.map((e) => e.country.startsWith("the") ? "T" + e.country.slice(1) : e.country)}
        />
      </div>
      <div class="w-2/3 md:w-1/2 pt-3 relative">
        <Button
          action="primary"
          disabled={status.isLoading}
          onClick={handleRegister}
        >
          {status.isLoading && <Spinner />} Register
        </Button>
        {status.error && <div class="text-sm text-red-400">{status.error}</div>}
        <Link href="/auth/login">Already have an account? Login</Link>
      </div>
    </div>
  );
}
