// import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Création d’un utilisateur
//   const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      username: "faty",
      email: "faty@example.com",
      password: "hashedPassword",
      phone: "0600000000",
      role: "user",
    },
  });

  // Création de tags
  const tag1 = await prisma.tag.create({
    data: {
      name: "Inspiration",
    },
  });

  const tag2 = await prisma.tag.create({
    data: {
      name: "Captivant",
    },
  });

  // Création d’un post
  const post = await prisma.post.create({
    data: {
      title: "Premier post",
      description: "Voici mon tout premier post !",
      image_url: "https://placekitten.com/400/300",
      user_id: user.id,
      tags: {
        create: [
          { tag: { connect: { id: tag1.id } } },
          { tag: { connect: { id: tag2.id } } },
        ],
      },
    },
  });

  // Commentaire sur le post
  await prisma.comment.create({
    data: {
      content: "Super photo !",
      user_id: user.id,
      post_id: post.id,
    },
  });

  // Like du post
  await prisma.likePost.create({
    data: {
      user_id: user.id,
      post_id: post.id,
    },
  });
}

main()
  .then(() => {
    console.log("🌱 Données de seed insérées avec succès");
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect().finally(() => process.exit(1));
  });
