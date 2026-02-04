'use server'

import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-me')

async function getSession() {
    const token = (await cookies()).get('session')?.value
    if (!token) return null
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY)
        return payload as { userId: string, email: string }
    } catch {
        return null
    }
}

export async function addProperty(prevState: any, formData: FormData) {
    const session = await getSession()
    if (!session) return { message: 'Unauthorized' }

    try {
        const title = (formData.get('title') as string || '').trim()
        const priceStr = (formData.get('price') as string || '').replace(/[^0-9.]/g, '')
        const price = parseFloat(priceStr)
        const location = (formData.get('location') as string || '').trim()
        const description = (formData.get('description') as string || '').trim()
        const landArea = parseFloat(formData.get('landArea') as string || '0') || 0
        const buildingArea = parseFloat(formData.get('buildingArea') as string || '0') || 0
        const yearBuilt = parseInt(formData.get('yearBuilt') as string || '0') || 0
        const legality = (formData.get('legality') as string || '').trim()
        const features = (formData.get('features') as string || '').trim()
        const status = (formData.get('status') as string || 'AVAILABLE')

        // Images handling
        const imagesRaw = formData.get('images') as string
        const images = JSON.parse(imagesRaw || '[]')

        if (!title || isNaN(price) || !location) {
            return { message: 'Nama, Harga, dan Lokasi wajib diisi.' }
        }

        await prisma.property.create({
            data: {
                title,
                price,
                location,
                description,
                landArea,
                buildingArea,
                yearBuilt,
                legality,
                features,
                status,
                agentId: session.userId,
                images: {
                    create: images.map((url: string) => ({ url }))
                }
            }
        })
    } catch (e) {
        console.error('Error creating property:', e)
        return { message: 'Terjadi kesalahan sistem saat menyimpan properti.' }
    }

    revalidatePath('/app/listing')
    revalidatePath('/app/dashboard')
    return { success: true, message: 'Properti berhasil ditambahkan' }
}
