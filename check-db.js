const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        include: {
            properties: true
        }
    })
    console.log('--- DATABASE REPORT ---')
    console.log(`Total Users: ${users.length}`)
    users.forEach(u => {
        console.log(`\n[Agent] ${u.name} (${u.email}) - Agency: ${u.agency}`)
        console.log(`  Properties: ${u.properties.length}`)
        u.properties.forEach(p => {
            console.log(`    - ${p.title} (${p.price})`)
        })
    })
    console.log('\n-----------------------')
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
