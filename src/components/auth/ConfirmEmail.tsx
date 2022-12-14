import { useEffect } from "preact/hooks";
import { supabase } from "../../supabase/supabase";

export default function ConfirmEmail() {
  useEffect(() => {
    if (typeof window === "undefined") return;

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
            console.error(r.error);
          }

          fetch("/api/login", {
            method: "POST",
            headers: new Headers({ "Content-Type": "application/json" }),
            credentials: "same-origin",
            body: JSON.stringify({
              access_token: r.data.session?.access_token,
              refresh_token: r.data.session?.refresh_token,
            }),
          }).then((r) => {
            if (!r.ok) {
              console.error("Failed to login");
            }

            window.location.hash = "";
            window.location.href = "/";
          });
        });
    } else {
      console.error("No token found");
      window.location.href = "/";
    }
  }, []);

  return <div />;
}
