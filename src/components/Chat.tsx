import { useEffect, useState } from "preact/hooks";
import { calculateDeliveryTime, getTimeOfDelivery } from "../delivery";
import {
  Message,
  PigeonMailUser,
  supabase,
  UserData,
} from "../supabase/supabase";
import CountdownEnvelope from "./chat/CountdownEnvelope";
import Mail from "./chat/Mail";
import MailHeader from "./chat/MailHeader";
import Button from "./shared/Button";
import Spinner from "./shared/Spinner";

export default function ChatView({
  user: pigeonMailUser,
}: {
  user: PigeonMailUser;
}) {
  const [user, setUser] = useState(pigeonMailUser.data);

  useEffect(() => {
    const subscription = supabase
      .channel("chat-user-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => {
          const n = payload.new as UserData;
          const o = payload.old as UserData;

          if (n.id === user.id) {
            if (!n.searching_today && o.searching_today) {
              if (
                Notification.permission === "granted" &&
                document.visibilityState === "hidden"
              ) {
                // eslint-disable-next-line no-new
                new Notification("Pigeon Mail", {
                  body: "We've found you a pen pal!",
                  icon: "/favicon.svg",
                });
              }
            }

            setUser(payload.new as UserData);
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
      {user.pen_pal !== null ? <Chat user={user} /> : <Search user={user} />}
    </div>
  );
}

function Chat({ user }: { user: UserData }) {
  const [penPal, setPenPal] = useState<UserData>();
  const [state, setState] = useState<{
    message: Message | null;
    turn: "user" | "pen_pal" | "waiting";
    deliveryDate: Date | null;
  }>();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.pen_pal);

      if (error != null) {
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

      if (messageError != null) {
        console.error(messageError);
        return;
      }

      const message = messages[0] ?? null;

      let turn;

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
            const n = payload.new as Message;

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
        deliveryDate: message == null ? null : getTimeOfDelivery(message),
      });

      return () => {
        subscription.unsubscribe();
      };
    })();
  }, [user.pen_pal]);

  return (
    <div class="w-full flex flex-col justify-center items-center">
      <div class="w-11/12 md:w-2/3 flex flex-col items-center justify-center">
        {state == null && <Spinner />}
        {penPal !== undefined && (
          <div class="flex flex-col w-full items-center justify-center">
            <h2 class="text-3xl text-center mb-6 mt-3">
              Today you're chatting with{" "}
              <strong class="font-bold">{penPal?.name}</strong> from{" "}
              <strong class="font-bold">{penPal?.country}</strong>!
            </h2>
          </div>
        )}

        {/* No messages have been sent yet */}
        {state != null && state.message == null && penPal != null && (
          <p>
            {state.turn === "user"
              ? "Ready to send the first message?"
              : `It's ${penPal.name}'s turn to send the first message, check back in a bit!`}
          </p>
        )}

        {/* Message is in transit */}
        {state?.deliveryDate != null &&
          state?.message != null &&
          state.turn === "waiting" && (
            <CountdownEnvelope
              sender={
                (state.message.sender === user.id ? user : penPal) as UserData
              }
              recipient={
                (state.message.sender === user.id ? penPal : user) as UserData
              }
              message={state.message}
              onCountdownCompleted={() => {
                if (
                  state.message?.recipient === user.id &&
                  Notification.permission === "granted" &&
                  document.visibilityState === "hidden" &&
                  penPal != null
                ) {
                  const notif = new Notification(
                    `New message from ${penPal.name}!`,
                    {
                      body: "Check your pigeon mail!",
                      icon: "/favicon.ico",
                    }
                  );

                  notif.onclick = () => {
                    window.focus();
                  };
                }

                setState(
                  (state) =>
                    ({
                      ...state,
                      turn:
                        state?.message?.sender === user.id ? "pen_pal" : "user",
                    } as any)
                );
              }}
            />
          )}

        {/* Message received */}
        {state?.message != null &&
          penPal != null &&
          state.turn !== "waiting" &&
          state.message.sender === penPal.id && (
            <Mail content={state.message.content} sender={penPal} />
          )}

        {/* Message sent, and has been received by the pen pal */}
        {state?.message != null &&
          state.message.sender === user.id &&
          state.turn !== "waiting" && (
            <p>
              {penPal?.name} has received your message! Remember to check back
              later to see their reply!
            </p>
          )}

        {/* Sending a message */}
        {state != null &&
          penPal != null &&
          state.turn !== "waiting" &&
          ((state.message != null && state.message.recipient === user.id) ||
            (state.message == null && state.turn === "user")) && (
            <div class="pt-4 w-full flex items-center justify-center">
              <SendMailScreen user={user} penPal={penPal} />
            </div>
          )}
      </div>
    </div>
  );
}

function SendMailScreen({
  user,
  penPal,
}: {
  user: UserData;
  penPal: UserData;
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

    if (error != null) {
      console.error(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <div class="w-full md:w-4/5 px-6 py-3 bg-gray-50 rounded border border-gray-100">
      <MailHeader sender={user} />
      <div>
        <form onSubmit={handleSubmit}>
          <textarea
            class="w-full h-96 mb-8 flex p-3 rounded-lg border border-gray-50"
            placeholder="Write your message here..."
            value={content}
            onInput={(e) => setContent((e.target as HTMLInputElement).value)}
          />
          <Button action="primary" type="submit" loading={loading}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}

function Search({ user }: { user: UserData }) {
  const [searching, setSearching] = useState(user.searching_today);

  const handleChangeSearchState = async (searching: boolean) => {
    const { error } = await supabase
      .from("users")
      .update({
        searching_today: searching,
      })
      .eq("id", user.id);

    if (error != null) {
      console.error(error.message);
      return;
    }

    setSearching(searching);
  };

  return (
    <div class="w-4/5 md:w-2/3 flex flex-col items-center justify-center">
      {!searching && (
        <>
          <h2 class="text-3xl text-center">
            You haven't got a pen pal yet today. Ready to find your new best
            friend?
          </h2>
          <div class="md:w-2/5 pt-6">
            <Button
              action="primary"
              onClick={async () => await handleChangeSearchState(true)}
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
          <div class="md:w-2/5 pt-6">
            <Button
              action="danger"
              onClick={async () => await handleChangeSearchState(false)}
            >
              Stop Searching
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
