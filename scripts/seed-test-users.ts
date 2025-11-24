import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables!')
  console.error('Please ensure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
const prisma = new PrismaClient()

const testUsers = [
  {
    email: 'john@familytest.com',
    password: 'test123456',
    name: 'John Smith',
    dateOfBirth: '1980-05-15',
    location: 'New York, USA',
    profession: 'Software Engineer',
    values: ['Family', 'Integrity', 'Hard Work'],
    tags: ['Tech', 'Travel', 'Photography'],
  },
  {
    email: 'sarah@familytest.com',
    password: 'test123456',
    name: 'Sarah Smith',
    dateOfBirth: '1982-08-20',
    location: 'New York, USA',
    profession: 'Teacher',
    values: ['Education', 'Family', 'Kindness'],
    tags: ['Education', 'Reading', 'Cooking'],
  },
  {
    email: 'michael@familytest.com',
    password: 'test123456',
    name: 'Michael Johnson',
    dateOfBirth: '1975-03-10',
    location: 'Los Angeles, USA',
    profession: 'Doctor',
    values: ['Health', 'Service', 'Family'],
    tags: ['Medicine', 'Sports', 'Music'],
  },
  {
    email: 'emily@familytest.com',
    password: 'test123456',
    name: 'Emily Johnson',
    dateOfBirth: '1978-11-25',
    location: 'Los Angeles, USA',
    profession: 'Designer',
    values: ['Creativity', 'Beauty', 'Family'],
    tags: ['Design', 'Art', 'Fashion'],
  },
]

async function createTestUsers() {
  console.log('🌱 Starting to seed test users...\n')

  const createdProfiles = []

  for (const userData of testUsers) {
    try {
      let authData: any = null
      
      // Try to get existing user first
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers?.users.find(u => u.email === userData.email)

      if (existingUser) {
        console.log(`ℹ️  User already exists: ${userData.email}`)
        authData = { user: existingUser }
      } else {
        // Create user in Supabase Auth
        const { data, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
        })

        if (authError) {
          console.error(`❌ Failed to create user ${userData.email}:`, authError.message)
          continue
        }

        authData = data
        console.log(`✅ Created user: ${userData.email}`)
      }

      // Create User record in Prisma first
      await prisma.user.upsert({
        where: { id: authData.user.id },
        update: { email: userData.email },
        create: {
          id: authData.user.id,
          email: userData.email,
        },
      })

      // Check if profile exists
      const existingProfile = await prisma.profile.findUnique({
        where: { userId: authData.user.id },
      })

      let profile
      if (existingProfile) {
        // Update existing profile
        profile = await prisma.profile.update({
          where: { userId: authData.user.id },
          data: {
            name: userData.name,
            dateOfBirth: new Date(userData.dateOfBirth),
            location: userData.location,
            profession: userData.profession,
            values: userData.values,
            tags: userData.tags,
            highlights: `This is a test profile for ${userData.name}. Created for testing purposes.`,
          },
        })
        console.log(`✅ Updated profile for: ${userData.name}`)
      } else {
        // Create profile in database
        profile = await prisma.profile.create({
          data: {
            userId: authData.user.id,
            name: userData.name,
            dateOfBirth: new Date(userData.dateOfBirth),
            location: userData.location,
            profession: userData.profession,
            values: userData.values,
            tags: userData.tags,
            highlights: `This is a test profile for ${userData.name}. Created for testing purposes.`,
          },
        })
        console.log(`✅ Created profile for: ${userData.name}`)
      }

      createdProfiles.push(profile)
      console.log('')
    } catch (error: any) {
      console.error(`❌ Error processing ${userData.email}:`, error.message)
    }
  }

  // Create family relationships
  if (createdProfiles.length >= 2) {
    console.log('🔗 Creating family relationships...\n')
    
    // John and Sarah are spouses
    if (createdProfiles[0] && createdProfiles[1]) {
      await prisma.familyMember.createMany({
        data: [
          {
            profileId: createdProfiles[0].id,
            relatedProfileId: createdProfiles[1].id,
            relationshipType: 'SPOUSE',
            role: 'CONTRIBUTOR',
          },
          {
            profileId: createdProfiles[1].id,
            relatedProfileId: createdProfiles[0].id,
            relationshipType: 'SPOUSE',
            role: 'CONTRIBUTOR',
          },
        ],
      })
      console.log(`✅ Connected ${createdProfiles[0].name} and ${createdProfiles[1].name} as spouses`)
    }

    // Michael and Emily are spouses
    if (createdProfiles[2] && createdProfiles[3]) {
      await prisma.familyMember.createMany({
        data: [
          {
            profileId: createdProfiles[2].id,
            relatedProfileId: createdProfiles[3].id,
            relationshipType: 'SPOUSE',
            role: 'CONTRIBUTOR',
          },
          {
            profileId: createdProfiles[3].id,
            relatedProfileId: createdProfiles[2].id,
            relationshipType: 'SPOUSE',
            role: 'CONTRIBUTOR',
          },
        ],
      })
      console.log(`✅ Connected ${createdProfiles[2].name} and ${createdProfiles[3].name} as spouses`)
    }
  }

  // Create some timeline entries
  if (createdProfiles.length > 0) {
    console.log('\n📅 Creating sample timeline entries...\n')
    
    const timelineEntries = [
      {
        profileId: createdProfiles[0].id,
        title: 'Started New Job',
        description: 'Joined a new company as a Senior Software Engineer',
        date: new Date('2023-01-15'),
        type: 'Career',
      },
      {
        profileId: createdProfiles[0].id,
        title: 'Family Vacation',
        description: 'Amazing trip to Hawaii with the whole family',
        date: new Date('2023-07-20'),
        type: 'Family',
      },
      {
        profileId: createdProfiles[1].id,
        title: 'Published First Book',
        description: 'My first children\'s book was published!',
        date: new Date('2023-03-10'),
        type: 'Achievement',
      },
    ]

    for (const entry of timelineEntries) {
      await prisma.timelineEntry.create({ data: entry })
      console.log(`✅ Created timeline entry: ${entry.title}`)
    }
  }

  // Create story prompts
  console.log('\n💭 Creating story prompts...\n')
  const prompts = [
    { question: 'Tell us about your first job', category: 'Career' },
    { question: "What's a value your parents passed down to you?", category: 'Values' },
    { question: 'Describe a memorable family vacation', category: 'Family' },
    { question: 'What was your biggest challenge and how did you overcome it?', category: 'Life' },
    { question: 'Share a story about your grandparents', category: 'Family' },
    { question: 'What achievement are you most proud of?', category: 'Achievement' },
  ]

  for (const prompt of prompts) {
    await prisma.storyPrompt.create({ data: prompt })
    console.log(`✅ Created prompt: ${prompt.question}`)
  }

  console.log('\n✨ Seeding complete!\n')
  console.log('📧 Test User Credentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  testUsers.forEach((user) => {
    console.log(`Email: ${user.email}`)
    console.log(`Password: ${user.password}`)
    console.log(`Name: ${user.name}`)
    console.log('')
  })
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

createTestUsers()
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

