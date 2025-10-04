const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addProductWithVariants() {
  try {
    // Create a product with variants
    const product = await prisma.product.create({
      data: {
        name: 'T-Shirt Kampus – Edisi Terbatas',
        description: 'T-shirt cotton combed 30s dengan berbagai pilihan warna dan ukuran. Desain eksklusif universitas dengan kualitas premium.',
        price: 89000,
        originalPrice: 120000,
        image: '/api/placeholder/400/400',
        category: 'Pakaian',
        isNew: true,
        isOnSale: true,
        stock: 50,
        hasVariants: true,
        variants: {
          create: [
            {
              name: 'Warna',
              options: {
                create: [
                  { name: 'Putih' },
                  { name: 'Hitam' },
                  { name: 'Navy' },
                  { name: 'Maroon' }
                ]
              }
            },
            {
              name: 'Ukuran',
              options: {
                create: [
                  { name: 'S' },
                  { name: 'M' },
                  { name: 'L' },
                  { name: 'XL' },
                  { name: 'XXL' }
                ]
              }
            }
          ]
        }
      },
      include: {
        variants: {
          include: {
            options: true
          }
        }
      }
    });

    console.log('Product with variants created:', product);

    // Create another product with different variants
    const product2 = await prisma.product.create({
      data: {
        name: 'Hoodie University – Premium Quality',
        description: 'Hoodie fleece premium dengan berbagai pilihan warna. Nyaman dipakai dan cocok untuk cuaca dingin.',
        price: 199000,
        originalPrice: 250000,
        image: '/api/placeholder/400/400',
        category: 'Pakaian',
        isNew: true,
        isOnSale: true,
        stock: 30,
        hasVariants: true,
        variants: {
          create: [
            {
              name: 'Colour',
              options: {
                create: [
                  { name: 'Black' },
                  { name: 'Grey' },
                  { name: 'Navy Blue' }
                ]
              }
            },
            {
              name: 'Size',
              options: {
                create: [
                  { name: 'M' },
                  { name: 'L' },
                  { name: 'XL' }
                ]
              }
            },
            {
              name: 'Material',
              options: {
                create: [
                  { name: 'Cotton Fleece' },
                  { name: 'Polyester Blend' }
                ]
              }
            }
          ]
        }
      },
      include: {
        variants: {
          include: {
            options: true
          }
        }
      }
    });

    console.log('Second product with variants created:', product2);

  } catch (error) {
    console.error('Error creating products with variants:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addProductWithVariants();