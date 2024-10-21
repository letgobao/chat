import { auth } from "@clerk/nextjs/server";
import { HttpStatusCode } from "axios";
import { NextResponse } from "next/server";
import prisma from "@/lib/database";
import { Prisma } from "@prisma/client";
import { getParams } from "@/lib/format";
import { PusherEvent, PusherServer } from "@/lib/pusher";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { conversationId, content } = body;
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", {
        status: HttpStatusCode.Unauthorized,
      });
    }

    const membership = await prisma.members.findUnique({
      where: {
        memberId_conversationId: {
          memberId: userId,
          conversationId,
        },
      },
      include: {
        member: { select: { name: true, imageUrl: true } },
      },
    });

    if (!membership) {
      return new NextResponse("You cannot text here", {
        status: HttpStatusCode.Forbidden,
      });
    }

    const message = await prisma.$transaction(
      async (tc: Prisma.TransactionClient) => {
        const message = await tc.messages.create({
          data: {
            senderId: userId,
            content,
            conversationId,
          },
        });

        await tc.conversations.update({
          where: { id: conversationId },
          data: {
            lastMessageId: message.id,
            lastActive: new Date(),
          },
        });
        return { ...message, sender: membership.member };
      }
    );

    const allMembers = await prisma.members.findMany({
      where: { conversationId },
      select: { memberId: true },
    });

    await PusherServer.trigger(
      conversationId,
      PusherEvent.NEW_MESSAGE,
      message
    );

    await Promise.all(
      allMembers.map((member) =>
        PusherServer.trigger(
          member.memberId,
          PusherEvent.NEW_MESSAGE,
          { conversationId, lastMessage: message.content }
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { conversationId } = getParams(
      searchParams,
      "conversationId"
    );

    if (!conversationId) {
      return NextResponse.json([]);
    }

    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", {
        status: HttpStatusCode.Unauthorized,
      });
    }
    const isMembership = await prisma.members.findUnique({
      where: {
        memberId_conversationId: {
          memberId: userId,
          conversationId,
        },
      },
    });

    if (!isMembership) {
      return NextResponse.json([]);
    }

    const messages = await prisma.messages.findMany({
      where: { conversationId },
      orderBy: { createdAt: Prisma.SortOrder.desc },
      include: { sender: true },
    });

    return NextResponse.json(
      messages.map((message) => ({
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        isCurrentUser: message.senderId === userId,
        senderId: message.senderId,
        sender: {
          name: message.sender.name,
          imageUrl: message.sender.imageUrl,
        },
      }))
    );
  } catch (error) {
    return new NextResponse("Unexpected error occurred!", {
      status: HttpStatusCode.InternalServerError,
    });
  }
}
