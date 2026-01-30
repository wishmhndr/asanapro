'use server'

import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { sendVerificationEmail, generateOTP } from '@/lib/email'

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-me')

export async function loginAgent(prevState: any, formData: FormData) {
    const email = (formData.get('email') as string).toLowerCase().trim()
    const pin = (formData.get('pin') as string).trim()

    if (!email || !pin) return { message: 'Email and PIN required' }

    try {
        console.log('Login attempt:', email);
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            console.log('User not found');
            return { message: 'User not registered' }
        }

        console.log('User found, verifying PIN...');
        const isValid = await bcrypt.compare(pin, user.password)
        console.log('PIN valid:', isValid);

        if (!isValid) {
            return { message: 'PIN Salah (Wrong Password)' }
        }

        // Check email verification
        if (!user.isEmailVerified) {
            console.log('Email not verified, sending OTP...');

            // Generate new OTP
            const otp = generateOTP();
            const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            // Save OTP to database
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    verificationToken: otp,
                    verificationExpiry: expiry
                }
            });

            // Send OTP email
            await sendVerificationEmail(user.email, otp, user.name);

            // Store userId in cookie for verification page
            (await cookies()).set('pendingVerification', user.id, {
                httpOnly: true,
                maxAge: 60 * 15, // 15 minutes
                path: '/',
            });

            return { message: 'Email belum terverifikasi. Kode OTP telah dikirim ke email Anda.', needsVerification: true };
        }

        // Create session
        const token = await new SignJWT({ userId: user.id, email: user.email })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(SECRET_KEY);

        (await cookies()).set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        })

    } catch (e) {
        console.error(e);
        return { message: 'Server error' }
    }

    redirect('/app/dashboard')
}

export async function getMe() {
    try {
        const sessionToken = (await cookies()).get('session')?.value
        if (!sessionToken) return null

        const { payload } = await jwtVerify(sessionToken, SECRET_KEY)
        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            select: { id: true, email: true, name: true, agency: true, phoneNumber: true, updatedAt: true }
        })
        return user
    } catch (e) {
        return null
    }
}

export async function logoutAgent() {
    (await cookies()).delete('session')
    redirect('/')
}

export async function getDashboardData() {
    const user = await getMe();
    if (!user) return null;

    try {
        const [activeCount, soldCount, clientCount] = await Promise.all([
            prisma.property.count({ where: { agentId: user.id, status: 'AVAILABLE' } }),
            prisma.property.count({ where: { agentId: user.id, status: 'SOLD' } }),
            prisma.client.count({ where: { agentId: user.id } })
        ]);

        // Get 5 most recent activities (we can mock this or use a real logs table if exists)
        // For now, let's get recent clients as activity
        const recentClients = await prisma.client.findMany({
            where: { agentId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        const activities = recentClients.map(c => ({
            id: c.id,
            text: `Klien baru terdaftar: ${c.name}`,
            at: c.createdAt.toISOString()
        }));

        return {
            stats: { activeCount, soldCount, clientCount },
            activities
        };
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function getClients() {
    const user = await getMe();
    if (!user) return [];

    try {
        const clients = await prisma.client.findMany({
            where: { agentId: user.id },
            orderBy: { createdAt: 'desc' }
        });
        return clients;
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function getClient(id: string) {
    const user = await getMe();
    if (!user) return null;

    try {
        const client = await prisma.client.findUnique({
            where: { id, agentId: user.id },
            include: {
                interactionLogs: {
                    orderBy: { createdAt: 'desc' }
                },
                interestedProperties: {
                    include: { images: true }
                }
            }
        });
        return client;
    } catch (e) {
        console.error(e);
        return null;
    }
}


export async function createClient(formData: FormData) {
    const user = await getMe();
    if (!user) return { success: false, message: 'Unauthorized' };

    const name = formData.get('name') as string;
    const whatsapp = formData.get('whatsapp') as string;
    const prospect = formData.get('prospect') as string;

    try {
        const client = await prisma.client.create({
            data: {
                name,
                whatsapp,
                status: prospect,
                agentId: user.id
            }
        });
        return { success: true, clientId: client.id };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Gagal membuat klien' };
    }
}

export async function updateClient(id: string, formData: FormData) {
    const user = await getMe();
    if (!user) return { success: false, message: 'Unauthorized' };

    const prospect = formData.get('prospect') as string;
    const minBudget = formData.get('minBudget') ? parseFloat(formData.get('minBudget') as string) : null;
    const maxBudget = formData.get('maxBudget') ? parseFloat(formData.get('maxBudget') as string) : null;
    const notes = formData.get('notes') as string;

    try {
        const client = await prisma.client.update({
            where: { id, agentId: user.id },
            data: {
                status: prospect,
                minBudget,
                maxBudget,
                notes
            }
        });
        return { success: true, client };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Gagal update klien' };
    }
}

export async function addInteractionLog(clientId: string, formData: FormData) {
    const user = await getMe();
    if (!user) return { success: false, message: 'Unauthorized' };

    // Verify client ownership
    const client = await prisma.client.findFirst({ where: { id: clientId, agentId: user.id } });
    if (!client) return { success: false, message: 'Client not found' };

    const content = formData.get('content') as string;

    try {
        await prisma.interactionLog.create({
            data: {
                content,
                clientId: client.id
            }
        });
        return { success: true };
    } catch (e) {
        return { success: false, message: 'Gagal menambah log' };
    }
}

export async function deleteClient(id: string) {
    const user = await getMe();
    if (!user) return { success: false, message: 'Unauthorized' };

    try {
        await prisma.client.delete({
            where: { id, agentId: user.id }
        });
        return { success: true };
    } catch (e) {
        return { success: false, message: 'Gagal menghapus klien' };
    }
}

export async function addClientInterest(clientId: string, propertyId: string) {
    const user = await getMe();
    if (!user) return { success: false, message: 'Unauthorized' };

    try {
        // Verify ownership
        const client = await prisma.client.findFirst({ where: { id: clientId, agentId: user.id } });
        const prop = await prisma.property.findFirst({ where: { id: propertyId, agentId: user.id } });

        if (!client || !prop) return { success: false, message: 'Data not found' };

        await prisma.client.update({
            where: { id: clientId },
            data: {
                interestedProperties: {
                    connect: { id: propertyId }
                }
            }
        });
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Gagal menambahkan properti' };
    }
}

export async function removeClientInterest(clientId: string, propertyId: string) {
    const user = await getMe();
    if (!user) return { success: false, message: 'Unauthorized' };

    try {
        await prisma.client.update({
            where: { id: clientId, agentId: user.id },
            data: {
                interestedProperties: {
                    disconnect: { id: propertyId }
                }
            }
        });
        return { success: true };
    } catch (e) {
        return { success: false, message: 'Gagal menghapus properti' };
    }
}

export async function getClientRecommendedProperties(minBudget?: number | null, maxBudget?: number | null) {
    const user = await getMe();
    if (!user) return [];

    try {
        // Simple filter: if budget provided, find within range. 
        // If no budget, return recent available properties.
        const where: any = {
            agentId: user.id,
            status: 'AVAILABLE'
        };

        if (minBudget) {
            where.price = { gte: minBudget };
        }
        if (maxBudget) {
            where.price = { ...where.price, lte: maxBudget };
        }

        const props = await prisma.property.findMany({
            where,
            include: { images: true },
            orderBy: { createdAt: 'desc' },
            take: 6
        });
        return props;
    } catch (e) {
        return [];
    }
}

export async function getSettings() {
    return await getMe();
}

export async function updateSettings(prevState: any, formData: FormData) {
    const user = await getMe();
    if (!user) return { message: 'Unauthorized' };

    const name = formData.get('name') as string;
    const agency = formData.get('agency') as string;
    const phoneNumber = formData.get('phone') as string;

    try {
        await prisma.user.update({
            where: { id: user.id },
            data: { name, agency, phoneNumber }
        });
        return { message: 'Profil berhasil diperbarui' };
    } catch (e) {
        console.error(e);
        return { message: 'Gagal memperbarui profil' };
    }
}

export async function getProperties() {
    const user = await getMe();
    if (!user) return [];

    try {
        const props = await prisma.property.findMany({
            where: { agentId: user.id },
            include: { images: true },
            orderBy: { createdAt: 'desc' }
        });
        return props;
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function createProperty(formData: FormData) {
    const user = await getMe();
    if (!user) return { success: false, message: 'Unauthorized' };

    const title = formData.get('title') as string;
    const price = parseFloat(formData.get('price') as string);
    const location = formData.get('location') as string;
    const description = formData.get('description') as string;
    const landArea = parseFloat(formData.get('landArea') as string) || 0;
    const buildingArea = parseFloat(formData.get('buildingArea') as string) || 0;
    const yearBuilt = parseInt(formData.get('yearBuilt') as string) || 0;
    const legality = formData.get('legality') as string;
    const features = formData.get('features') as string;

    // Simple image handling: assume base64 from client for now
    const imagesRaw = formData.get('images') as string; // Will come as JSON string of array
    const images = JSON.parse(imagesRaw || '[]');

    try {
        const prop = await prisma.property.create({
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
                agentId: user.id,
                images: {
                    create: images.map((url: string) => ({ url }))
                }
            }
        });
        return { success: true, propertyId: prop.id };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Gagal membuat properti' };
    }
}

export async function updateProperty(id: string, formData: FormData) {
    const user = await getMe();
    if (!user) return { success: false, message: 'Unauthorized' };

    const title = formData.get('title') as string;
    const price = parseFloat(formData.get('price') as string);
    const location = formData.get('location') as string;
    const description = formData.get('description') as string;
    const landArea = parseFloat(formData.get('landArea') as string) || 0;
    const buildingArea = parseFloat(formData.get('buildingArea') as string) || 0;
    const yearBuilt = parseInt(formData.get('yearBuilt') as string) || 0;
    const legality = formData.get('legality') as string;
    const features = formData.get('features') as string;
    const status = formData.get('status') as string;

    try {
        await prisma.property.update({
            where: { id, agentId: user.id },
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
                status
            }
        });
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Gagal memperbarui properti' };
    }
}

export async function deleteProperty(id: string) {
    const user = await getMe();
    if (!user) return { success: false, message: 'Unauthorized' };

    try {
        await prisma.property.delete({
            where: { id, agentId: user.id }
        });
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Gagal menghapus properti' };
    }
}

export async function getProperty(id: string) {
    try {
        const prop = await prisma.property.findUnique({
            where: { id },
            include: {
                images: true,
                agent: {
                    select: { name: true, agency: true, phoneNumber: true }
                }
            }
        });
        return prop;
    } catch (e) {
        return null;
    }
}

export async function registerAgent(prevState: any, formData: FormData) {
    const name = formData.get('name') as string
    const email = (formData.get('email') as string).toLowerCase().trim()
    const pin = (formData.get('pin') as string).trim()
    const agency = formData.get('agency') as string
    const phoneNumber = formData.get('phone') as string

    if (!email || !pin || !name) return { message: 'Missing fields' }

    console.log('Registering:', { email, name, agency });
    try {
        const ex = await prisma.user.findUnique({ where: { email } })
        console.log('Existing user:', ex);
        if (ex) return { message: 'Email already registered' }

        const hashedPassword = await bcrypt.hash(pin, 10)

        // Generate OTP
        const otp = generateOTP();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                agency,
                phoneNumber,
                verificationToken: otp,
                verificationExpiry: expiry,
                isEmailVerified: false
            }
        })

        // Send OTP email
        await sendVerificationEmail(user.email, otp, user.name);

        // Store userId in cookie for verification page
        (await cookies()).set('pendingVerification', user.id, {
            httpOnly: true,
            maxAge: 60 * 15, // 15 minutes
            path: '/',
        });

    } catch (e) {
        console.error('Registration Error:', e);
        return { message: `Failed to create account: ${(e as any)?.message || 'Unknown error'}` }
    }

    redirect('/verify-email')
}

export async function getReportStats() {
    const user = await getMe();
    if (!user) return null;

    try {
        const [
            propsTotal,
            propsAvailable,
            propsSold,
            clientsTotal,
            clientsCold,
            clientsWarm,
            clientsHot,
            recentReports
        ] = await Promise.all([
            prisma.property.count({ where: { agentId: user.id } }),
            prisma.property.count({ where: { agentId: user.id, status: 'AVAILABLE' } }),
            prisma.property.count({ where: { agentId: user.id, status: 'SOLD' } }),
            prisma.client.count({ where: { agentId: user.id } }),
            prisma.client.count({ where: { agentId: user.id, status: 'Cold' } }),
            prisma.client.count({ where: { agentId: user.id, status: 'Warm' } }),
            prisma.client.count({ where: { agentId: user.id, status: 'Hot' } }),
            prisma.report.findMany({
                where: { agentId: user.id },
                orderBy: { createdAt: 'desc' },
                take: 10
            })
        ]);

        // Also get list of active properties for table view
        const activeProperties = await prisma.property.findMany({
            where: { agentId: user.id, status: 'AVAILABLE' },
            orderBy: { createdAt: 'desc' }
        });

        return {
            props: { total: propsTotal, available: propsAvailable, sold: propsSold, list: activeProperties },
            clients: { total: clientsTotal, cold: clientsCold, warm: clientsWarm, hot: clientsHot },
            reports: recentReports
        };
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function createReport(formData: FormData) {
    const user = await getMe();
    if (!user) return { success: false, message: 'Unauthorized' };

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;

    try {
        await prisma.report.create({
            data: {
                title,
                content,
                category,
                agentId: user.id
            }
        });
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Gagal membuat laporan' };
    }
}


export async function deleteReport(id: string) {
    const user = await getMe();
    if (!user) return { success: false, message: 'Unauthorized' };

    try {
        await prisma.report.delete({
            where: { id, agentId: user.id }
        });
        return { success: true };
    } catch (e) {
        return { success: false, message: 'Gagal menghapus laporan' };
    }
}

// Email Verification Actions
export async function verifyOTP(prevState: any, formData: FormData) {
    const otp = (formData.get('otp') as string).trim();

    if (!otp || otp.length !== 6) {
        return { message: 'Kode OTP harus 6 digit' };
    }

    try {
        const userId = (await cookies()).get('pendingVerification')?.value;
        if (!userId) {
            return { message: 'Sesi verifikasi tidak valid. Silakan login kembali.' };
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return { message: 'User tidak ditemukan' };
        }

        if (!user.verificationToken || !user.verificationExpiry) {
            return { message: 'Kode OTP tidak ditemukan. Silakan minta kode baru.' };
        }

        // Check if OTP expired
        if (new Date() > user.verificationExpiry) {
            return { message: 'Kode OTP sudah kadaluarsa. Silakan minta kode baru.' };
        }

        // Verify OTP
        if (user.verificationToken !== otp) {
            return { message: 'Kode OTP salah. Silakan coba lagi.' };
        }

        // Mark email as verified
        await prisma.user.update({
            where: { id: user.id },
            data: {
                isEmailVerified: true,
                verificationToken: null,
                verificationExpiry: null
            }
        });

        // Create session (auto-login)
        const token = await new SignJWT({ userId: user.id, email: user.email })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(SECRET_KEY);

        (await cookies()).set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        // Clear pending verification cookie
        (await cookies()).delete('pendingVerification');

    } catch (e) {
        console.error(e);
        return { message: 'Terjadi kesalahan. Silakan coba lagi.' };
    }

    redirect('/app/dashboard');
}

export async function resendOTP() {
    try {
        const userId = (await cookies()).get('pendingVerification')?.value;
        if (!userId) {
            return { success: false, message: 'Sesi verifikasi tidak valid.' };
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return { success: false, message: 'User tidak ditemukan' };
        }

        // Generate new OTP
        const otp = generateOTP();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.user.update({
            where: { id: user.id },
            data: {
                verificationToken: otp,
                verificationExpiry: expiry
            }
        });

        // Send new OTP
        await sendVerificationEmail(user.email, otp, user.name);

        return { success: true, message: 'Kode OTP baru telah dikirim ke email Anda.' };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Gagal mengirim kode OTP. Silakan coba lagi.' };
    }
}

export async function getPendingVerificationUser() {
    try {
        const userId = (await cookies()).get('pendingVerification')?.value;
        if (!userId) return null;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true }
        });

        return user;
    } catch (e) {
        return null;
    }
}

