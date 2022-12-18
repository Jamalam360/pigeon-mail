import { useEffect, useState } from "preact/hooks";
import {
  getUserStatistics,
  PigeonMailUser,
  UserStatistics,
} from "../supabase/supabase";
import Countup from "./Countup";
import Spinner from "./shared/Spinner";

export default function Statistics({ user }: { user: PigeonMailUser }) {
  const [stats, setStats] = useState<UserStatistics | null>(null);

  useEffect(() => {
    getUserStatistics(user.auth.id).then((stats) => setStats(stats));
  }, [user]);

  return (
    <>
      {stats !== null
        ? (
          <>
            <div class="flex flex-col items-center justify-center py-4 w-3/5">
              <p class="text-2xl">
                {user.data.name}, {stats.pen_pals === 0
                  ? (
                    <>
                      you haven't spoken to anyone yet,{" "}
                      <a href="/chat" class="text-maize">
                        get started
                      </a>{" "}
                      now.
                    </>
                  )
                  : (
                    <>
                      you've spoken to {stats.pen_pals === 1
                        ? (
                          <>
                            1 pen pal from{" "}
                            {stats.pen_pal_countries[0]}! So much more to
                            discover!
                          </>
                        )
                        : (
                          <>
                            <Countup target={stats.pen_pals} /> pen pals from
                            {" "}
                            <Countup target={stats.pen_pal_countries.length} />
                            {" "}
                            {stats.pen_pal_countries.length === 1
                              ? "country"
                              : "countries"}!
                          </>
                        )}
                    </>
                  )}
              </p>
            </div>

            <div class="flex flex-row flex-wrap w-3/5">
              {stats.pen_pal_countries.map((country) => (
                <img
                  src={`https://countryflagsapi.com/svg/${country}`}
                  class="w-1/6 m-2"
                  alt={country}
                />
              ))}
            </div>
          </>
        )
        : <Spinner />}
    </>
  );
}
