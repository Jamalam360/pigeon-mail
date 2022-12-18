import { useEffect, useState } from "preact/hooks";
import { supabase } from "../../supabase/supabase";

export default function ConfirmEmail() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.hash.slice(1));
    const token = sp.get("access_token");
    const refreshToken = sp.get("refresh_token");

    if (token != null && refreshToken != null) {
      supabase.auth
        .setSession({
          access_token: token,
          refresh_token: refreshToken,
        })
        .then((r) => {
          if (r.error != null) {
            setError("Invalid link");
          }

          fetch("/api/login", {
            method: "POST",
            headers: new Headers({ "Content-Type": "application/json" }),
            credentials: "same-origin",
            body: JSON.stringify({
              access_token: r.data.session?.access_token,
              refresh_token: r.data.session?.refresh_token,
            }),
          }).then((_) => {
            window.location.hash = "";
            window.location.href = "/";
          });
        });
    } else {
      setError("Invlaid link");
    }
  }, []);

  return <>{error != null && <p class="text-sm text-red-400">{error}</p>}</>;
}
