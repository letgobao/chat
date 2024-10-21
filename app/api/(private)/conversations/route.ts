import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/database";
import { HttpStatusCode } from "axios";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", {
        status: HttpStatusCode.Unauthorized,
      });
    }

    const memberships = (
      await prisma.members.findMany({
        where: { memberId: userId },
      })
    ).map((memberships) => memberships.conversationId);

    if (memberships.length === 0) {
      return NextResponse.json([]);
    }

    const conversations =
      await prisma.conversations.findMany({
        where: { id: { in: memberships } },
        include: { members: true },
        orderBy: { lastActive: Prisma.SortOrder.desc },
      });

    if (conversations.length === 0) {
      return NextResponse.json([]);
    }

    const allMembers = conversations
      .flatMap((conversation) => conversation.members)
      .map((membership) => membership.memberId);
    const allLastMessageId = conversations
      .map((conversation) => conversation.lastMessageId)
      .filter((messageId) => !!messageId);
    if (allLastMessageId.length === 0) {
      allLastMessageId[0] = "";
    }
    const [users, messages] = await Promise.all([
      prisma.users.findMany({
        where: { id: { in: allMembers } },
      }),
      prisma.messages.findMany({
        where: { id: { in: allLastMessageId as string[] } },
        select: { content: true, id: true },
      }),
    ]);

    const mapping = conversations.map((conversation) => {
      const otherMembers =
        conversation.members?.flatMap((membership) => {
          if (membership.memberId === userId) return [];
          const detail = users.find(
            (user) => user.id === membership.memberId
          );
          if (!detail) return [];
          return [
            {
              name: detail.name,
              imageUrl: detail.imageUrl,
              email: detail.email,
            },
          ];
        }) ?? [];

      const lastMessage = messages.find(
        (message) =>
          message.id === conversation.lastMessageId
      );

      return {
        name: conversation.name,
        id: conversation.id,
        isGroup: conversation.isGroup,
        lastMessage: lastMessage?.content ?? null,
        otherMembers,
      };
    });

    return NextResponse.json(mapping);
  } catch (error) {
    return new NextResponse("Unexpected error occurred!", {
      status: HttpStatusCode.InternalServerError,
    });
  }
}
