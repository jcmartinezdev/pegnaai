"use server";

import {
  clearAllSyncDataForUser,
  createUser,
  getUser,
  updateUser,
} from "@/db/queries";
import { auth0 } from "@/lib/auth0";
import { ActionResponse } from "@/lib/types";

export default async function saveSyncSettings({
  enableSync,
}: {
  enableSync: boolean;
}): Promise<ActionResponse<string>> {
  const session = await auth0.getSession();
  if (!session) {
    return {
      success: false,
      error: "User not authenticated",
    };
  }

  const userId = session.user.sub;

  // Delete all existing threads and messages from the server
  // if the user decided not to sync data anymore
  if (!enableSync) {
    await clearAllSyncDataForUser(userId);
  }

  // Save the new flag
  const user = await getUser(userId);
  if (!user) {
    await createUser({
      id: userId,
      enableSync,
    });
  } else {
    await updateUser(userId, {
      enableSync,
    });
  }

  return {
    success: true,
    data: "Sync settings saved successfully",
  };
}
