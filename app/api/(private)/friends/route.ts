import { User } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { HttpStatusCode } from "axios";
import { NextResponse } from "next/server";
import prisma from "@/lib/database";
import { getParams } from "@/lib/format";

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    const { searchParams } = new URL(req.url);
    const { page, size } = getParams(
      searchParams,
      "page",
      "size"
    );

    if (!userId) {
      return new NextResponse("Unauthorized", {
        status: HttpStatusCode.Unauthorized,
      });
    }
    const friendships = await prisma.friends.findMany({
      where: {
        OR: [{ userId }, { friendId: userId }],
      },
      take: +size || 20,
      skip: (+page - 1) * size,
    });

    if (friendships.length === 0)
      return NextResponse.json([]);

    const friendId = friendships.map((friendship) =>
      friendship.userId === userId
        ? friendship.friendId
        : friendship.userId
    );

    const friends = await prisma.users.findMany({
      where: { id: { in: friendId } },
    });

    return NextResponse.json(friends);
  } catch (error) {
    return new NextResponse("Unexpected error occurred!", {
      status: HttpStatusCode.InternalServerError,
    });
  }
}
