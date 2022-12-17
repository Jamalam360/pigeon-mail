import { UserData } from "../../supabase/supabase";
import MailHeader from "./MailHeader";

export default function Mail({
  content,
  sender,
}: {
  content: string;
  sender: UserData;
}) {
  return (
    <div class="w-full px-6 py-3 bg-gray-50 rounded border border-gray-100">
      <MailHeader sender={sender} />
      {content}
    </div>
  );
}
