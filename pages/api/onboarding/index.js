import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/api";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, username, bio } = req.body;
    
    // Get user email from Clerk
    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress || '';

    // Create or update user in the database
    const dbUser = await prisma.user.upsert({
      where: { userId: userId },
      update: {
        name,
        username,
        bio,
        onboarded: true,
      },
      create: {
        userId: userId,
        name,
        username,
        email: email,
        bio,
        onboarded: true,
      },
    });
    
    return res.status(200).json({ user: dbUser });
  } catch (error) {
    console.error("Error in onboarding:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
