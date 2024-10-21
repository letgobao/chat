// import prisma from "@/lib/database";
import type {
  UserJSON,
  WebhookEvent,
} from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import prisma from "@/lib/database";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard"
    );
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get(
    "svix-timestamp"
  );
  const svix_signature = headerPayload.get(
    "svix-signature"
  );

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response(
      "Error occurred -- no svix headers",
      {
        status: 400,
      }
    );
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  if (evt.type !== "user.created") {
    return new Response("", { status: 200 });
  }

  const {
    id,
    email_addresses,
    first_name,
    last_name,
    image_url,
  } = evt.data as UserJSON;

  if (!id || !email_addresses?.length) {
    return new Response("Error occurred -- missing data", {
      status: 400,
    });
  }

  const user: Prisma.usersUncheckedUpdateInput = {
    id,
    email: email_addresses[0].email_address,
    name: first_name + " " + last_name,
    imageUrl: image_url,
  };

  await prisma.users.upsert({
    where: {
      id,
    },
    update: {
      ...user,
    },
    create: {
      ...user,
    },
  });

  return new Response("", { status: 200 });
}
