require('dotenv').config();

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const restaurantData = {
    name: 'Restaurante Demo',
    slug: 'restaurante-demo',
    whatsapp: '31999990000'
  };

  const restaurant = await prisma.restaurant.upsert({
    where: { slug: restaurantData.slug },
    update: {
      name: restaurantData.name,
      whatsapp: restaurantData.whatsapp
    },
    create: restaurantData
  });

  const password = await bcrypt.hash('123456', 10);

  await prisma.user.upsert({
    where: { email: 'owner@restaurante-demo.com' },
    update: {
      name: 'Administrador',
      password,
      role: 'owner',
      restaurantId: restaurant.id
    },
    create: {
      name: 'Administrador',
      email: 'owner@restaurante-demo.com',
      password,
      role: 'owner',
      restaurantId: restaurant.id
    }
  });

  await prisma.product.deleteMany({
    where: { restaurantId: restaurant.id }
  });

  await prisma.category.deleteMany({
    where: { restaurantId: restaurant.id }
  });

  const categories = await prisma.$transaction([
    prisma.category.create({
      data: {
        name: 'Lanches',
        restaurantId: restaurant.id
      }
    }),
    prisma.category.create({
      data: {
        name: 'Bebidas',
        restaurantId: restaurant.id
      }
    }),
    prisma.category.create({
      data: {
        name: 'Sobremesas',
        restaurantId: restaurant.id
      }
    })
  ]);

  const [lanches, bebidas, sobremesas] = categories;

  await prisma.product.createMany({
    data: [
      {
        name: 'X-Salada',
        description: 'Pão, hambúrguer, queijo, alface e tomate',
        price: 24.9,
        imageUrl: null,
        available: true,
        categoryId: lanches.id,
        restaurantId: restaurant.id
      },
      {
        name: 'Batata Frita',
        description: 'Porção crocante para acompanhar',
        price: 14.9,
        imageUrl: null,
        available: true,
        categoryId: lanches.id,
        restaurantId: restaurant.id
      },
      {
        name: 'Refrigerante 350ml',
        description: 'Lata gelada',
        price: 6.5,
        imageUrl: null,
        available: true,
        categoryId: bebidas.id,
        restaurantId: restaurant.id
      },
      {
        name: 'Brownie com Sorvete',
        description: 'Sobremesa da casa',
        price: 18.0,
        imageUrl: null,
        available: true,
        categoryId: sobremesas.id,
        restaurantId: restaurant.id
      }
    ]
  });

  console.log('Seed concluído com sucesso.');
  console.log('Login demo: owner@restaurante-demo.com / 123456');
}

main()
  .catch((error) => {
    console.error('Erro ao executar seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
