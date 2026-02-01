import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Limpiamos la base de datos para no repetir
  await prisma.activity.deleteMany();
  await prisma.shoe.deleteMany();
  await prisma.user.deleteMany();

  // 2. Creamos el Usuario
  const user = await prisma.user.create({
    data: {
      email: "runner@whyshoes.com",
      name: "Runner Pro",
    },
  });

  // 3. Creamos los Tenis (Nike Alphafly 3)
  const shoe = await prisma.shoe.create({
    data: {
      brand: "Nike",
      model: "Alphafly 3",
      totalDistance: 0, // Empiezan nuevos
      userId: user.id,
      maxDistance: 600, // Vida útil estimada
    },
  });

  // 4. Creamos una Actividad (Carrera de 12km)
  await prisma.activity.create({
    data: {
      distance: 12.5,
      duration: 3600, // 1 hora
      pace: 4.8, // min/km
      userId: user.id,
      shoeId: shoe.id, // Vinculamos la carrera a los tenis
    },
  });

  // Actualizamos el kilometraje del zapato (Simulación de la lógica de negocio)
  await prisma.shoe.update({
    where: { id: shoe.id },
    data: { totalDistance: 12.5 },
  });

  console.log("✅ ¡Datos sembrados! Tenis y carrera creados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });