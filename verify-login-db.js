// Verification Script

// Instead, let's just use the Reset Script I verified earlier, but adapted to purely TEST login via Prisma + Bcrypt
// ignoring the Next.js Action wrapper for a moment to verify DB state again.

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function testLogin(email, pin) {
    console.log(`\nTesting Login for: ${email} with PIN: ${pin}`)

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
        console.log('RESULT: User NOT FOUND in DB.')
        return
    }

    console.log('User found in DB. Verifying password...')
    const isValid = await bcrypt.compare(pin, user.password)

    if (isValid) {
        console.log('RESULT: SUCCESS! Password matches.')
    } else {
        console.log('RESULT: FAILED! Password mismatch.')
        console.log('Stored Hash:', user.password)

        // Debug: what should the hash be?
        const expectedHash = await bcrypt.hash(pin, 10)
        console.log('Expected Hash (approx):', expectedHash)
    }
}

async function main() {
    await testLogin('akun1@gmail.com', '123456')
    await testLogin('admin1@gmail.com', '123456')
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
