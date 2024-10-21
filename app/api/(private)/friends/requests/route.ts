import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/database";
import { generateFriendKey } from "@/lib/friend-key";
import { Prisma } from "@prisma/client";
import { HttpStatusCode } from "axios";
import { PusherEvent, PusherServer } from "@/lib/pusher";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;
    if (!email) {
      return new NextResponse("Email not provided", {
        status: HttpStatusCode.BadRequest,
      });
    }

    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", {
        status: HttpStatusCode.Unauthorized,
      });
    }

    const users = await prisma.users.findMany({
      where: {
        OR: [{ id: userId }, { email: email }],
      },
      select: {
        id: true,
        email: true,
      },
    });

    const user = users.find((u) => u.id === userId);

    if (!user) {
      return new NextResponse("Unauthorized", {
        status: HttpStatusCode.Unauthorized,
      });
    }

    if (user.email == email) {
      return new NextResponse(
        "Can not send a request to yourself",
        {
          status: HttpStatusCode.BadRequest,
        }
      );
    }

    const receiver = users.find((u) => u.email === email);

    if (!receiver) {
      return new NextResponse("Receiver not found", {
        status: HttpStatusCode.NotFound,
      });
    }

    const friendKey = generateFriendKey(
      user.id,
      receiver.id
    );

    const [oldRequest, alreadyFriend] = await Promise.all([
      prisma.requests.findUnique({
        where: { id: friendKey },
      }),
      prisma.friends.findUnique({
        where: { id: friendKey },
      }),
    ]);

    if (!!alreadyFriend) {
      return new NextResponse(
        "You are already friends with this user",
        {
          status: HttpStatusCode.BadRequest,
        }
      );
    }

    if (!oldRequest) {
      await prisma.requests.create({
        data: {
          senderId: user.id,
          receiverId: receiver.id,
          id: friendKey,
        },
      });

      PusherServer.trigger(
        receiver.id,
        PusherEvent.NEW_REQUEST,
        null
      );

      return new NextResponse("Success", {
        status: HttpStatusCode.Ok,
      });
    }

    if (oldRequest.senderId === user.id) {
      return new NextResponse("Request already sent", {
        status: HttpStatusCode.BadRequest,
      });
    }

    return new NextResponse(
      "This user has already sent you a request",
      {
        status: HttpStatusCode.BadRequest,
      }
    );
  } catch (error) {
    return new NextResponse("Unexpected error occurred!", {
      status: HttpStatusCode.InternalServerError,
    });
  }
}

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", {
        status: HttpStatusCode.Unauthorized,
      });
    }

    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return new NextResponse("Unauthorized", {
        status: HttpStatusCode.Unauthorized,
      });
    }

    const requests = await prisma.requests.findMany({
      where: { receiverId: user.id },
      select: {
        id: true,
        sender: {
          select: {
            email: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    return new NextResponse("Unexpected error occurred!", {
      status: HttpStatusCode.InternalServerError,
    });
  }
}

export async function OPTIONS() {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", {
        status: HttpStatusCode.Unauthorized,
      });
    }

    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return new NextResponse("Unauthorized", {
        status: HttpStatusCode.Unauthorized,
      });
    }
    const count = await prisma.requests.count({
      where: { receiverId: user.id },
    });

    return NextResponse.json({ count });
  } catch (error) {
    return new NextResponse("Unexpected error occurred!", {
      status: HttpStatusCode.Unauthorized,
    });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, isAccept } = body;

    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", {
        status: HttpStatusCode.Unauthorized,
      });
    }

    const request = await prisma.requests.findUnique({
      where: { id },
    });

    if (!request || request.receiverId !== userId) {
      return new NextResponse(
        "There was an error denying this request",
        {
          status: HttpStatusCode.BadRequest,
        }
      );
    }

    if (!isAccept) {
      await prisma.requests.delete({ where: { id } });
      PusherServer.trigger(
        userId,
        PusherEvent.HANDLE_REQUEST,
        null
      );
      return new NextResponse("Success", {
        status: HttpStatusCode.Ok,
      });
    }

    const friendKey = generateFriendKey(
      request.senderId,
      request.receiverId
    );
    await prisma.$transaction(
      async (tc: Prisma.TransactionClient) => {
        const { id: conversationId } =
          await tc.conversations.create({
            data: {
              isGroup: false,
            },
            select: { id: true },
          });

        await tc.friends.create({
          data: {
            id: friendKey,
            userId: request.senderId,
            friendId: request.receiverId,
            conversationId,
          },
        });

        await tc.members.createMany({
          data: [
            {
              conversationId,
              memberId: request.senderId,
            },
            {
              conversationId,
              memberId: request.receiverId,
            },
          ],
        });

        await tc.requests.delete({
          where: { id },
        });
      }
    );
    PusherServer.trigger(
      userId,
      PusherEvent.HANDLE_REQUEST,
      null
    );
    PusherServer.trigger(
      request.senderId,
      PusherEvent.NEW_CONVERSATION,
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
