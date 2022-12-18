import { useState } from "preact/hooks";
import countries from "../../data/countries_by_name.json";
import { supabase } from "../../supabase/supabase";
import Button from "../shared/Button";
import Dropdown from "../shared/Dropdown";
import Input from "../shared/Input";
import Link from "../shared/Link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");

  const [status, setStatus] = useState({
    error: "",
    loading: false,
  });

  const handleRegister = async (e: Event) => {
    e.preventDefault();

    setStatus({ error: "", loading: true });

    if (password !== passwordConfirmation) {
      setStatus({
        error: "Passwords do not match",
        loading: false,
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
      options: {
        emailRedirectTo: "http://localhost:3000/auth/confirm-email",
      },
    });

    if (error != null) {
      setStatus(() => ({
        error: error.message,
        success: false,
        loading: false,
      }));
      return;
    } else if (data.user == null) {
      setStatus(() => ({
        error: "Something went wrong",
        success: false,
        loading: false,
      }));
      return;
    }

    const { error: iError } = await supabase.from("users").insert({
      id: data.user.id,
      country: country.startsWith("The") ? "t" + country.slice(1) : country,
      name,
      avatar: `https://source.boringavatars.com/beam/120/${name}?colors=${colors.join(
        ","
      )}`,
    });

    if (iError != null) {
      await supabase.functions.invoke("remove_failed_user", {
        body: {
          id: data.user.id,
        },
      });

      setStatus(() => ({
        error: iError.message,
        success: false,
        loading: false,
      }));
      return;
    }

    setStatus({ error: "", loading: false });
    window.location.href = "/auth/please-confirm-email";
  };

  return (
    <div class="w-full flex flex-col items-center justify-center">
      <h1 class="text-3xl text-center pb-4">Register</h1>
      <form onSubmit={handleRegister} class="w-4/5 md:w-1/2 space-y-2">
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
        <Input
          disabled={status.loading}
          required={true}
          id="password"
          value={password}
          updater={setPassword}
          label="Password"
          type="password"
        />
        <Input
          disabled={status.loading}
          id="confirm-password"
          value={passwordConfirmation}
          updater={setPasswordConfirmation}
          label="Confirm password"
          type="password"
        />
        <div class="pt-4" />
        <Input
          disabled={status.loading}
          required={true}
          id="name"
          placeholder="James"
          value={name}
          updater={setName}
          label="First Name"
          type="text"
        />
        <Dropdown
          disabled={status.loading}
          required={true}
          id="country"
          onChange={(e) => setCountry((e.target as HTMLOptionElement).value)}
          label="Country"
          values={countries.map((e) =>
            e.country.startsWith("the") ? "T" + e.country.slice(1) : e.country
          )}
        />
        <div class="pt-3 relative flex flex-col space-y-2">
          <Button action="primary" loading={status.loading} type="submit">
            Register
          </Button>
          {status.error !== "" && (
            <p class="text-sm text-red-400">{status.error}</p>
          )}
          <Link href="/auth/login">Already have an account?</Link>
        </div>
      </form>
    </div>
  );
}
