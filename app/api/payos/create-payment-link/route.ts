import { NextRequest, NextResponse } from 'next/server';
import { PayOS } from '@payos/node';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const payos = new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID!,
    apiKey: process.env.PAYOS_API_KEY!,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY!
});

export async function POST(req: NextRequest) {
    const cookieStore = await cookies();

    // 1. Verify Authentication
    const authClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: any) {
                    cookieStore.set({ name, value, ...options });
                },
                remove(name: string, options: any) {
                    cookieStore.set({ name, value: '', ...options });
                },
            },
        }
    );

    const { data: { session } } = await authClient.auth.getSession();

    if (!session) {
        return NextResponse.json({ success: false, error: 'Vui lòng đăng nhập để thực hiện giao dịch.' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { amount, packageId, packageName, linhThach } = body;

        if (!amount || !packageId) {
            return NextResponse.json({ success: false, error: 'Thiếu thông tin gói nạp.' }, { status: 400 });
        }

        // 2. Generate Order ID (must be unique integer for PayOS)
        const orderId = Number(String(Date.now()).slice(-9)) + Math.floor(Math.random() * 1000);

        // 3. Prepare PayOS Data
        const domain = process.env.NEXT_PUBLIC_DOMAIN ||
            (req.headers.get('origin') || `${req.nextUrl.protocol}//${req.nextUrl.host}`);

        const description = `Thanh toan ${packageName || 'LT'}`;
        const paymentData = {
            orderCode: orderId,
            amount: amount,
            description: description.slice(0, 25),
            cancelUrl: `${domain}/nap-linh-thach/cancel`,
            returnUrl: `${domain}/nap-linh-thach/success`,
            items: [
                {
                    name: packageName || 'Linh Thạch',
                    quantity: 1,
                    price: amount
                }
            ]
        };

        // 4. Record Transaction in DB
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: { autoRefreshToken: false, persistSession: false }
            }
        );

        const { error: dbError } = await supabase
            .from('transactions')
            .insert({
                order_id: orderId,
                user_id: session.user.id,
                amount: amount,
                linh_thach: linhThach,
                status: 'pending'
            });

        if (dbError) {
            console.error('Database error recording transaction:', dbError);
            throw new Error('Không thể khởi tạo giao dịch trong hệ thống.');
        }

        // 5. Create PayOS Payment Link using v2 API
        const paymentLink = await payos.paymentRequests.create(paymentData);

        return NextResponse.json({
            success: true,
            checkoutUrl: paymentLink.checkoutUrl
        });

    } catch (error: any) {
        console.error('PayOS Create Payment Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Lỗi hệ thống khi tạo link thanh toán.'
        }, { status: 500 });
    }
}
