"use server";

import { MOODS } from "@/app/lib/moods";
import { auth } from "@clerk/nextjs/server";
import { useId } from "react";
import { getPixabayImage } from "./public";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";



export async function createJournalEntry(data) {
    try {
        const { userId } = await auth();
        if (!useId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId,
            }
        });

        if (!user) throw new Error("User not found");

        const mood = MOODS[data.mood.toUpperCase()];
        if (!mood) throw new Error("Invalid mood");

        const moodImgUrl = await getPixabayImage(data.moodQuery);

        const entry = await db.entry.create({
            data: {
                title: data.title,
                content: data.content,
                mood: mood.id,
                moodScore: mood.score,
                moodImgUrl,
                userId: user.id,
                collectionId: data.collectionId || null,
            },
        });

        await db.draft.deleteMany({
            where: { userId: user.id }
        });

        revalidatePath("/dashboard");

        return entry;

    } catch (error) {
        throw new Error(error.message);
    }
}

