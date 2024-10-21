import { getParams } from "@/lib/format";
import { auth } from "@clerk/nextjs/server";
import { HttpStatusCode } from "axios";
import { NextResponse } from "next/server";
import prisma from "@/lib/database";
import { Prisma } from "@prisma/client";
import { PusherEvent, PusherServer } from "@/lib/pusher";
export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    if (!userId) {
      return new NextResponse("Unauthorized", {
        status: HttpStatusCode.Unauthorized,
      });
    }

    const { list, name } = body;
    if (list.length <= 1 || !name) {
      return new NextResponse("Group data not valid", {
        status: HttpStatusCode.BadRequest,
      });
    }

    const checkExist = await prisma.users.count({
      where: { id: { in: [...list, userId] } },
    });

    if (checkExist < list + 1) {
      return new NextResponse(
        "Someone is unavailable to join the group",
        {
          status: HttpStatusCode.BadRequest,
        }
      );
    }

    await prisma.$transaction(
      async (tc: Prisma.TransactionClient) => {
        const group = await tc.conversations.create({
          data: {
            name,
            isGroup: true,
          },
        });

        await tc.members.createMany({
          data: [...list, userId].map((memberId) => ({
            memberId,
            conversationId: group.id,
          })),
        });
      }
    );

    [...list, userId].forEach((id) => {
      PusherServer.trigger(
        id,
        PusherEvent.NEW_CONVERSATION,
        null
      );
    });

    return new NextResponse("Success", {
      status: HttpStatusCode.Ok,
    });
  } catch (error) {
    return new NextResponse("Unexpected error occurred!", {
      status: HttpStatusCode.InternalServerError,
    });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", {
        status: HttpStatusCode.Unauthorized,
      });
    }
    const body = await req.json();
    const { list, conversationId } = body as {
      list: string[];
      conversationId: string;
    };
    if (list.length === 0) {
      return new NextResponse("Success", {
        status: HttpStatusCode.Ok,
      });
    }
    const [exist, conversation, memberships] =
      await Promise.all([
        prisma.users.findMany({
          where: { id: { in: list } },
          select: { id: true },
        }),
        prisma.conversations.findUnique({
          where: { id: conversationId },
        }),
        prisma.members.findMany({
          where: { conversationId },
        }),
      ]);

    if (exist.length < list.length) {
      return new NextResponse(
        "Someone is unavailable to join the group",
        {
          status: HttpStatusCode.BadRequest,
        }
      );
    }

    if (!conversation || !conversation.isGroup) {
      return new NextResponse("Group not valid", {
        status: HttpStatusCode.BadRequest,
      });
    }

    if (
      memberships.every(
        (membership) => membership.memberId !== userId
      )
    ) {
      return new NextResponse("Forbidden", {
        status: HttpStatusCode.Forbidden,
      });
    }

    const newMembers = list.filter((id: string) =>
      memberships.every((member) => member.memberId !== id)
    );

    await prisma.members.createMany({
      data: newMembers.map((memberId) => ({
        conversationId,
        memberId,
      })),
      skipDuplicates: true,
    });

    await Promise.all(
      newMembers.map((memberId) =>
        PusherServer.trigger(
          memberId,
          PusherEvent.NEW_CONVERSATION,
          null
        )
      )
    );
    return new NextResponse("Success", {
      status: HttpStatusCode.Ok,
    });
  } catch (error) {
    return new NextResponse("Unexpected error occurred!", {
      status: HttpStatusCode.InternalServerError,
    });
  }
}
