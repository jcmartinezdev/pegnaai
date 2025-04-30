"only server";
import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  session: {
    inactivityDuration: 60 * 60 * 24 * 3, // 3 days
    absoluteDuration: 60 * 60 * 24 * 7, // 7 days
  },
});
