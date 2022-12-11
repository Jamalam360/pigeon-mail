import { timerMessage } from "astro/dist/core/logger/core";
import { StateUpdater, useEffect, useState } from "preact/hooks";
import { calculateDeliveryTime, getCountdownString } from "../delivery";
import { PigeonMailUser, supabase } from "../supabase/supabase";
import { Database } from "../supabase/types.gen";
import Button from "./shared/Button";
import Spinner from "./shared/Spinner";

export default function Chat({
  user: pigeonMailUser,
}: {
  user: PigeonMailUser;
}) {
  const [user, setUser] = useState(pigeonMailUser.data);

  useEffect(() => {
    const subscription = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => {
          if (payload.new["id"] === user.id) {
            setUser(payload.new as PigeonMailUser["data"]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return (
    <div class="w-full flex justify-center items-center">
      {user.pen_pal ? (
        <ChatScreen user={user} />
      ) : (
        <SearchScreen user={user} setUser={setUser} />
      )}
    </div>
  );
}

function ChatScreen({ user }: { user: PigeonMailUser["data"] }) {
  const [penPal, setPenPal] = useState<PigeonMailUser["data"]>();
  const [state, setState] = useState<{
    message: Database["public"]["Tables"]["messages"]["Row"] | null;
    turn: "user" | "pen_pal" | "waiting";
    deliveryDate: Date | null;
  }>();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.pen_pal);

      if (error) {
        console.error(error);
        return;
      }

      setPenPal(data[0]);

      const { data: messages, error: messageError } = await supabase
        .from("messages")
        .select("*")
        .or(
          `sender.eq.${user.id},recipient.eq.${user.id},sender.eq.${data[0].id},recipient.eq.${data[0].id}`
        )
        .order("sent_at", { ascending: false })
        .limit(1);

      if (messageError) {
        console.error(messageError);
        return;
      }

      const message = messages[0] ?? null;

      let turn;

      console.log(message);

      if (message === null) {
        turn = user.id > data[0].id ? "user" : "pen_pal";
      } else {
        if (new Date().getTime() > getTimeOfDelivery(message).getTime()) {
          turn = message.sender === user.id ? "pen_pal" : "user";
        } else {
          turn = "waiting";
        }
      }

      const subscription = supabase
        .channel("ChatScreenMessages")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "messages" },
          (payload) => {
            const n =
              payload.new as Database["public"]["Tables"]["messages"]["Row"];

            if (n.recipient === user.id || n.sender === user.id) {
              const deliveryDate = getTimeOfDelivery(n);

              setState((state) => ({
                ...state,
                message: n,
                turn:
                  new Date().getTime() > deliveryDate.getTime()
                    ? n.sender === user.id
                      ? "pen_pal"
                      : "user"
                    : "waiting",
                deliveryDate,
              }));
            }
          }
        )
        .subscribe();

      setState({
        message,
        turn,
        deliveryDate: message ? getTimeOfDelivery(message) : null,
      });

      return () => {
        subscription.unsubscribe();
      };
    })();
  }, [user.pen_pal]);

  return (
    <div class="w-full flex flex-col justify-center items-center">
      <div class="w-2/3 flex flex-col items-center justify-center">
        <h2 class="text-3xl text-center mb-6">
          Today you're chatting with{" "}
          <strong class="font-bold">{penPal?.name}</strong> from{" "}
          <strong class="font-bold">{penPal?.country}</strong>!
        </h2>
        {!state && <Spinner />}

        {/* No messages have been sent yet */}
        {state && !state.message && (
          <p>
            {state.turn === "user"
              ? "Ready to send the first message?"
              : `It's ${penPal.name}'s turn to send the first message, check back in a bit!`}
          </p>
        )}

        {/* Message is in transit */}
        {state && state.deliveryDate && state.turn === "waiting" && (
          <ClosedEnvelope
            sender={state.message.sender === user.id ? user : penPal}
            recipient={state.message.sender === user.id ? penPal : user}
            message={state.message}
            onCountdownCompleted={() => {
              setState((state) => ({
                ...state,
                turn: "user",
              }));
            }}
          />
        )}

        {/* Message received */}
        {state &&
          state.message &&
          state.turn !== "waiting" &&
          state.message.sender === penPal.id && (
            <Message content={state.message.content} sender={penPal} />
          )}

        {/* Message sent, and has been received by the pen pal */}
        {state &&
          state.message &&
          state.message.sender === user.id &&
          state.turn !== "waiting" && (
            <p>
              {penPal?.name} has received your message! Remember to check back
              later to see their reply!
            </p>
          )}

        {/* Sending a message */}
        {state &&
          state.message &&
          state.turn !== "waiting" &&
          state.message.recipient === user.id && (
            <div class="pt-4 w-full flex items-center justify-center">
              <SendMailScreen user={user} penPal={penPal} />
            </div>
          )}
      </div>
    </div>
  );
}

function getTimeOfDelivery(
  message: Database["public"]["Tables"]["messages"]["Row"]
) {
  const deliveryDate = new Date(message.sent_at);
  deliveryDate.setTime(
    deliveryDate.getTime() + message.delivery_time * 60 * 60 * 1000
  );
  return deliveryDate;
}

function Countdown({
  date,
  onCompleted,
}: {
  date: Date;
  onCompleted: () => void;
}) {
  const [countdown, setCountdown] = useState(getCountdownString(date));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdownString(date));

      if (new Date().getTime() > date.getTime()) {
        onCompleted();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [date]);

  return <h2 class="font-bold text-5xl">{countdown}</h2>;
}

function ClosedEnvelope({
  message,
  recipient,
  sender,
  onCountdownCompleted,
}: {
  message: Database["public"]["Tables"]["messages"]["Row"];
  recipient: PigeonMailUser["data"];
  sender: PigeonMailUser["data"];
  onCountdownCompleted: () => void;
}) {
  return (
    <div class="w-4/5 h-80 p-6 rounded-lg bg-gray-100 border border-gray-50 flex flex-col items-center justify-between">
      <div class="w-full flex items-center justify-between">
        <img
          src={`https://countryflagsapi.com/svg/${sender.country}`}
          class="h-10"
        />
        <p>Express Delivery</p>
      </div>
      <div class="w-2/3 h-40 pt-12 text-xl flex flex-col">
        <p>{recipient.name},</p>
        <p>{recipient.country}</p>
      </div>
      <div class="h-16">
        <Countdown
          onCompleted={onCountdownCompleted}
          date={getTimeOfDelivery(message)}
        />
      </div>
    </div>
  );
}

function MailHeader({ sender }: { sender: PigeonMailUser["data"] }) {
  return (
    <div class="py-3 mb-3 border-gray-100 border-b">
      <div class="flex flex-row space-x-4 mb-4">
        <img src={sender.avatar} class="w-10 h-10" />
        <img
          src={`https://countryflagsapi.com/svg/${sender.country}`}
          class="h-10"
        />
      </div>
      <p class="italic">From the office of {sender.name}.</p>
    </div>
  );
}

function Message({
  content,
  sender,
}: {
  content: string;
  sender: PigeonMailUser["data"];
}) {
  return (
    <div class="w-4/5 px-6 py-3 bg-gray-50 rounded border border-gray-100">
      <MailHeader sender={sender} />
      {content}
    </div>
  );
}

function SendMailScreen({
  user,
  penPal,
}: {
  user: PigeonMailUser["data"];
  penPal: PigeonMailUser["data"];
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    const { error } = await supabase.from("messages").insert({
      sender: user.id,
      recipient: penPal.id,
      content,
      delivery_time: calculateDeliveryTime(user.country, penPal.country),
    });

    if (error) {
      console.error(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <div class="w-4/5 px-6 py-3 bg-gray-50 rounded border border-gray-100">
      <MailHeader sender={user} />
      <div>
        <form onSubmit={handleSubmit}>
          <textarea
            class="w-full h-96 mb-8 flex p-3 rounded-lg border border-gray-50"
            placeholder="Write your message here..."
            value={content}
            onInput={(e) => setContent((e.target as HTMLInputElement).value)}
          />
          <Button action="primary" type="submit" disabled={loading}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}

function SearchScreen({
  user,
  setUser,
}: {
  user: PigeonMailUser["data"];
  setUser: StateUpdater<PigeonMailUser["data"]>;
}) {
  const [searching, setSearching] = useState(user.searching_today);

  const handleChangeSearchState = async (searching: boolean) => {
    const { error } = await supabase
      .from("users")
      .update({
        searching_today: searching,
      })
      .eq("id", user.id);

    if (error) {
      console.error(error.message);
      return;
    }

    setSearching(searching);
  };

  useEffect(() => {
    (async () => {
      if (searching) {
        const searchingUsers = await supabase
          .from("users")
          .select("id")
          .eq("searching_today", true)
          .neq("id", user.id);

        const selected =
          searchingUsers.data[Math.floor(Math.random() * searchingUsers.count)];

        await Promise.all([
          supabase
            .from("users")
            .update({
              searching_today: false,
              pen_pal: user.id,
            })
            .eq("id", selected.id),
          await supabase
            .from("users")
            .update({
              searching_today: false,
              pen_pal: selected.id,
            })
            .eq("id", user.id),
        ]);

        await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .limit(1)
          .single()
          .then(({ data }) => setUser(data));
      }
    })().then(() => {});
  }, [searching]);

  return (
    <div class="w-2/3 flex flex-col items-center justify-center">
      {!searching && (
        <>
          <h2 class="text-3xl text-center">
            Ready to find your new best friend?
          </h2>
          <div class="w-2/5 pt-6">
            <Button
              action="primary"
              onClick={() => handleChangeSearchState(true)}
            >
              Start Searching
            </Button>
          </div>
        </>
      )}

      {searching && (
        <>
          <h2 class="text-3xl text-center">We're searching for someone!</h2>
          <p class="text-center">
            We haven't found anyone just yet, but make sure to keep checking
            back.
          </p>
          <div class="w-2/5 pt-6">
            <Button
              action="danger"
              onClick={() => handleChangeSearchState(false)}
            >
              Stop Searching
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
