import { StateUpdater, useEffect, useState } from "preact/hooks";
import { PigeonMailUser, supabase } from "../supabase/supabase";
import Button from "./shared/Button";

export default function Chat({
  user: pigeonMailUser,
}: {
  user: PigeonMailUser;
}) {
  const [user, setUser] = useState(pigeonMailUser.data);

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

  useEffect(() => {
    const fetchPenPal = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.pen_pal);

      if (error) {
        console.error(error);
        return;
      }

      setPenPal(data[0]);
    };

    fetchPenPal();
  }, [user.pen_pal]);

  return (
    <div class="w-full flex flex-col justify-center items-center">
      <div class="w-full max-w-md">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-2">
            <img
              class="w-10 h-10 rounded-full"
              src={penPal?.avatar}
              alt={penPal?.name}
            />
            <div class="text-2xl">{penPal?.name}</div>
            <img
              src={`https://countryflagsapi.com/svg/${penPal?.country}`}
              class="h-6"
            />
          </div>
          <div class="text-lg">Chat</div>
        </div>
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
