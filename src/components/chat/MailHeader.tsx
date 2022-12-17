import { UserData } from "../../supabase/supabase";

export default function MailHeader({ sender }: { sender: UserData }) {
  return (
    <div class="py-3 mb-3 border-gray-100 border-b">
      <div class="flex flex-row space-x-4 mb-4">
        <img src={sender.avatar} class="w-10 h-10" />
        <img
          src={`https://countryflagsapi.com/svg/${sender.country}`}
          class="h-10"
        />
      </div>
      <p class="italic">{sender.name}</p>
    </div>
  );
}
