import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/database";
import { NextResponse } from "next/server";
import { HttpStatusCode } from "axios";
import { generateFriendKey } from "@/lib/friend-key";
import { PusherEvent, PusherServer } from "@/lib/pusher";
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
    const friendship = await prisma.friends.findUnique({
      where: { conversationId },
    });

    if (!friendship) {
      return new NextResponse(
        "You are not friends with them",
        {
          status: HttpStatusCode.BadRequest,
        }
      );
    }

    await prisma.conversations.delete({
      where: { id: friendship.conversationId },
    });

    [friendship.userId, friendship.conversationId].forEach(
      (id) => {
        PusherServer.trigger(
          id,
          PusherEvent.LEAVE_CONVERSATION,
          null
        );
      }
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

export async function GET(
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
    const [memberships, friends] = await Promise.all([
      prisma.members.findMany({
        where: {
          conversationId,
        },
      }),
      prisma.users.findMany({
        where: {
          OR: [
            { friend1: { some: { friendId: userId } } },
            { friend2: { some: { userId } } },
          ],
        },
      }),
    ]);

    if (
      !memberships.find(
        (membership) => membership.memberId === userId
      )
    ) {
      return new NextResponse("Forbidden", {
        status: HttpStatusCode.Forbidden,
      });
    }

    return NextResponse.json(
      friends.filter((friend) =>
        memberships.every(
          (membership) => membership.memberId !== friend.id
        )
      )
    );
  } catch (error) {
    return new NextResponse("Unexpected error occurred!", {
      status: HttpStatusCode.InternalServerError,
    });
  }
}
