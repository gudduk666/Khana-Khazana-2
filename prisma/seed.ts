import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create Categories
  console.log('Creating categories...')
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Biryani' },
      update: {},
      create: {
        name: 'Biryani',
        active: true,
      },
    }),
    prisma.category.upsert({
      where: { name: 'Chicken' },
      update: {},
      create: {
        name: 'Chicken',
        active: true,
      },
    }),
    prisma.category.upsert({
      where: { name: 'Add On' },
      update: {},
      create: {
        name: 'Add On',
        active: true,
      },
    }),
  ])

  console.log(`Created ${categories.length} categories`)

  // Create Menu Items
  console.log('Creating menu items...')

  const biryaniCategory = categories.find(c => c.name === 'Biryani')
  const chickenCategory = categories.find(c => c.name === 'Chicken')
  const addOnCategory = categories.find(c => c.name === 'Add On')

  const menuItems = await Promise.all([
    // Biryani items
    prisma.menuItem.upsert({
      where: { id: 'biryani-1' },
      update: {},
      create: {
        id: 'biryani-1',
        name: 'Chicken Biryani',
        description: 'Aromatic basmati rice with tender chicken',
        price: 180,
        categoryId: biryaniCategory!.id,
        active: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'biryani-2' },
      update: {},
      create: {
        id: 'biryani-2',
        name: 'Mutton Biryani',
        description: 'Slow-cooked mutton with fragrant rice',
        price: 240,
        categoryId: biryaniCategory!.id,
        active: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'biryani-3' },
      update: {},
      create: {
        id: 'biryani-3',
        name: 'Veg Biryani',
        description: 'Mixed vegetables in spiced rice',
        price: 140,
        categoryId: biryaniCategory!.id,
        active: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'biryani-4' },
      update: {},
      create: {
        id: 'biryani-4',
        name: 'Egg Biryani',
        description: 'Boiled eggs in flavorful rice',
        price: 120,
        categoryId: biryaniCategory!.id,
        active: true,
      },
    }),

    // Chicken items
    prisma.menuItem.upsert({
      where: { id: 'chicken-1' },
      update: {},
      create: {
        id: 'chicken-1',
        name: 'Chicken Fried Rice',
        description: 'Fried rice with chicken pieces',
        price: 150,
        categoryId: chickenCategory!.id,
        active: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'chicken-2' },
      update: {},
      create: {
        id: 'chicken-2',
        name: 'Chicken Noodles',
        description: 'Stir-fried noodles with chicken',
        price: 130,
        categoryId: chickenCategory!.id,
        active: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'chicken-3' },
      update: {},
      create: {
        id: 'chicken-3',
        name: 'Chicken Manchurian',
        description: 'Indo-Chinese chicken balls',
        price: 160,
        categoryId: chickenCategory!.id,
        active: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'chicken-4' },
      update: {},
      create: {
        id: 'chicken-4',
        name: 'Chilli Chicken',
        description: 'Spicy chicken with peppers',
        price: 180,
        categoryId: chickenCategory!.id,
        active: true,
      },
    }),

    // Add On items
    prisma.menuItem.upsert({
      where: { id: 'addon-1' },
      update: {},
      create: {
        id: 'addon-1',
        name: 'Extra Chicken',
        description: 'Additional chicken pieces',
        price: 80,
        categoryId: addOnCategory!.id,
        active: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'addon-2' },
      update: {},
      create: {
        id: 'addon-2',
        name: 'Extra Rice',
        description: 'Additional rice serving',
        price: 30,
        categoryId: addOnCategory!.id,
        active: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'addon-3' },
      update: {},
      create: {
        id: 'addon-3',
        name: 'Egg',
        description: 'Boiled egg',
        price: 20,
        categoryId: addOnCategory!.id,
        active: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'addon-4' },
      update: {},
      create: {
        id: 'addon-4',
        name: 'Curry',
        description: 'Extra gravy curry',
        price: 60,
        categoryId: addOnCategory!.id,
        active: true,
      },
    }),
  ])

  console.log(`Created ${menuItems.length} menu items`)

  // Create a sample customer
  console.log('Creating sample customer...')
  const customer = await prisma.customer.upsert({
    where: { id: 'customer-1' },
    update: {},
    create: {
      id: 'customer-1',
      name: 'Guest Customer',
      phone: '9876543210',
    },
  })

  console.log('Database seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
