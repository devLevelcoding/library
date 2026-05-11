import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Setting / billboard
  await prisma.setting.create({
    data: {
      billboardTitle: 'New Collection 2024',
      billboardImageUrl:
        'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&q=80',
      currency: 'USD',
    },
  });

  // Sizes
  const [sizeS, sizeM, sizeL] = await Promise.all([
    prisma.size.create({ data: { name: 'Small', value: 'S', enabled: true } }),
    prisma.size.create({ data: { name: 'Medium', value: 'M', enabled: true } }),
    prisma.size.create({ data: { name: 'Large', value: 'L', enabled: true } }),
  ]);

  // Categories
  const [tShirts, jackets, accessories] = await Promise.all([
    prisma.category.create({ data: { name: 'T-Shirts', description: 'Casual everyday tees', enabled: true } }),
    prisma.category.create({ data: { name: 'Jackets', description: 'Stay warm in style', enabled: true } }),
    prisma.category.create({ data: { name: 'Accessories', description: 'Complete your look', enabled: true } }),
  ]);

  // Products
  const products = [
    {
      name: 'Classic White Tee',
      price: 29.99,
      isFeatured: true,
      isArchived: false,
      categoryId: tShirts.id,
      sizeId: sizeM.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80' },
      ],
    },
    {
      name: 'Vintage Graphic Tee',
      price: 34.99,
      isFeatured: true,
      isArchived: false,
      categoryId: tShirts.id,
      sizeId: sizeL.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80' },
      ],
    },
    {
      name: 'Oversized Black Tee',
      price: 32.99,
      isFeatured: true,
      isArchived: false,
      categoryId: tShirts.id,
      sizeId: sizeL.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80' },
      ],
    },
    {
      name: 'Leather Biker Jacket',
      price: 199.99,
      isFeatured: true,
      isArchived: false,
      categoryId: jackets.id,
      sizeId: sizeM.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80' },
      ],
    },
    {
      name: 'Denim Jacket',
      price: 89.99,
      isFeatured: true,
      isArchived: false,
      categoryId: jackets.id,
      sizeId: sizeS.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80' },
      ],
    },
    {
      name: 'Canvas Tote Bag',
      price: 24.99,
      isFeatured: true,
      isArchived: false,
      categoryId: accessories.id,
      sizeId: sizeM.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1544816565-aa8c1166648f?w=800&q=80' },
      ],
    },
    {
      name: 'Wool Beanie',
      price: 19.99,
      isFeatured: true,
      isArchived: false,
      categoryId: accessories.id,
      sizeId: sizeS.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80' },
      ],
    },
    {
      name: 'Striped Tee',
      price: 27.99,
      isFeatured: true,
      isArchived: false,
      categoryId: tShirts.id,
      sizeId: sizeS.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80' },
      ],
    },
  ];

  for (const product of products) {
    const { images, ...data } = product;
    await prisma.product.create({
      data: {
        ...data,
        images: { create: images },
      },
    });
  }

  console.log('✅ Seed complete — categories, sizes, and products created.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
