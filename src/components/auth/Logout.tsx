import { useState } from "preact/hooks";
import { supabase } from "../../supabase/supabase";
import Link from "../shared/Link";
import Button from "../shared/Button";
import Input from "../shared/Input";
import Spinner from "../shared/Spinner";

export default function Logout() {
  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "same-origin",
    });

    window.location.href = "/";
  };

  return (
    <Button action="danger" onClick={handleLogout}>
      Logout
    </Button>
  );
}
