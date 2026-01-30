const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const email = 'akun1@gmail.com' // Corrected email
    const newPin = '123456'

    console.log(`Resetting password for ${email} to ${newPin}...`)

    // Hash manually
    const hashedPassword = await bcrypt.hash(newPin, 10)
    console.log('New Hash:', hashedPassword)

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        })
        console.log('SUCCESS: User password updated.')
        console.log('User:', user)
    } catch (e) {
        console.error('ERROR:', e.message)
    }
}

main()
    .finally(async () => await prisma.$disconnect())
