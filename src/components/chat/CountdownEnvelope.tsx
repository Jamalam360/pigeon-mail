import { useEffect, useState } from "preact/hooks";
import { getCountdownString, getTimeOfDelivery } from "../../delivery";
import { Message, UserData } from "../../supabase/supabase";

export default function CountdownEnvelope({
  message,
  recipient,
  sender,
  onCountdownCompleted,
}: {
  message: Message;
  recipient: UserData;
  sender: UserData;
  onCountdownCompleted: () => void;
}) {
  const date = getTimeOfDelivery(message);
  const [countdown, setCountdown] = useState(getCountdownString(date));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdownString(date));

      if (new Date().getTime() > date.getTime()) {
        onCountdownCompleted();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [date]);

  return (
    <div class="w-full md:w-4/5 h-80 p-6 rounded-lg bg-gray-100 border border-gray-50 flex flex-col items-center justify-between">
      <div class="w-full flex space-y-4 flex-col md:flex-row items-center justify-between">
        <img
          src={`https://countryflagsapi.com/svg/${sender.country}`}
          class="h-8 md:h-10 rotate-6"
        />
        <span class="flex flex-row bg-slate-400 rounded p-2 -rotate-1">
          Express <img src="/favicon.svg" class="w-6 mx-2" /> Delivery
        </span>
      </div>
      <div class="w-2/3 h-40 pt-12 text-2xl md:text-3xl flex flex-col">
        <p>{recipient.name},</p>
        <p>{recipient.country}</p>
      </div>
      <div class="h-16">
        <h2 class="font-bold text-3xl md:text-5xl">{countdown}</h2>
      </div>
    </div>
  );
}
