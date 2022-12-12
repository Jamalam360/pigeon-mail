import { supabase } from "../../supabase/supabase";
import Button from "../shared/Button";

export default function Logout() {
  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "same-origin",
    });

    await supabase.auth.signOut();

    window.location.href = "/";
  };

  return (
    <Button action="danger" onClick={handleLogout}>
      Logout
    </Button>
  );
}
