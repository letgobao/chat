import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/database";
import { HttpStatusCode } from "axios";
import { PusherEvent, PusherServer } from "@/lib/pusher";

export async function GET(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { userId } = auth();
    const { conversationId } = params;

    if (!userId) {
      return new NextResponse("Unauthorized", {
        status: HttpStatusCode.Unauthorized,
      });
    }

    const [conversation, memberships] = await Promise.all([
      prisma.conversations.findUnique({
        where: { id: conversationId },
      }),
      prisma.members.findMany({
        where: {
          conversationId,
        },
        include: {
          member: true,
        },
      }),
    ]);

    if (
      !memberships.some(
        (membership) => membership.memberId === userId
      )
    ) {
      return new NextResponse(
        "You are not a member of this conversation",
        { status: HttpStatusCode.BadRequest }
      );
    }

    if (!conversation) {
      return new NextResponse("Conversation not found", {
        status: HttpStatusCode.NotFound,
      });
    }

    const otherMembers = memberships.flatMap((membership) =>
      membership.memberId !== userId
        ? [membership.member]
        : []
    );

    if (!conversation.isGroup) {
      conversation.name = otherMembers[0].name;
    }

    return NextResponse.json({
      ...conversation,
      imageUrl: !conversation.isGroup
        ? otherMembers[0].imageUrl
        : undefined,
      otherMembers,
    });
  } catch (error) {
    return new NextResponse("Unexpected error occurred!", {
      status: HttpStatusCode.InternalServerError,
    });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { userId } = auth();
    const { conversationId } = params;
    if (!userId) {
      return new NextResponse("Unauthorized", {
        status: HttpStatusCode.Unauthorized,
      });
    }
    const memberships = await prisma.members.findMany({
      where: {
        conversationId,
      },
    });

    if (
      !memberships.some(
        (membership) => membership.memberId === userId
      )
    ) {
      return new NextResponse("You are not in this group", {
        status: HttpStatusCode.BadRequest,
      });
    }

    if (memberships.length === 1) {
      await prisma.conversations.delete({
        where: { id: conversationId },
      });
    } else {
      await prisma.members.delete({
        where: {
          memberId_conversationId: {
            memberId: userId,
            conversationId,
          },
        },
      });
    }

    PusherServer.trigger(
      userId,
      PusherEvent.LEAVE_CONVERSATION,
      null
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
