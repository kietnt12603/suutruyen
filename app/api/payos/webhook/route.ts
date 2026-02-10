import { NextRequest, NextResponse } from 'next/server';
import { PayOS } from '@payos/node';
import { createClient } from '@supabase/supabase-js';

// Initialize PayOS lazily to avoid build-time errors if env vars are missing
const getPayOS = () => {
    if (!process.env.PAYOS_CLIENT_ID || !process.env.PAYOS_API_KEY || !process.env.PAYOS_CHECKSUM_KEY) {
        throw new Error('Missing PayOS environment variables');
    }
    return new PayOS({
        clientId: process.env.PAYOS_CLIENT_ID,
        apiKey: process.env.PAYOS_API_KEY,
        checksumKey: process.env.PAYOS_CHECKSUM_KEY
    });
};

export async function POST(req: NextRequest) {
    console.log('--- PAYOS WEBHOOK START ---');
    try {
        const body = await req.json();
        console.log('Raw Webhook Body:', JSON.stringify(body));

        // 1. Verify Webhook Data Integrity using v2 API
        // In @payos/node v2, verify is an async method
        const webhookData = await getPayOS().webhooks.verify(body);

        console.log('Verified Webhook Data:', JSON.stringify(webhookData));

        // success if status is 'PAID' or code is '00'
        if (webhookData.code === '00' || body.success === true) {
            const orderId = webhookData.orderCode;
            console.log(`Processing successful payment for Order ID: ${orderId}`);

            // 2. Initialize Supabase Admin
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
                {
                    auth: { autoRefreshToken: false, persistSession: false }
                }
            );

            // 3. Find transaction and check if already processed
            const { data: transaction, error: fetchError } = await supabase
                .from('transactions')
                .select('*')
                .eq('order_id', orderId)
                .single();

            if (fetchError || !transaction) {
                console.error('Transaction not found in DB for orderId:', orderId);
                return NextResponse.json({ success: false, message: 'Transaction not found' });
            }

            if (transaction.status === 'paid') {
                console.log('Transaction already marked as paid in DB:', orderId);
                return NextResponse.json({ success: true, message: 'Already processed' });
            }

            // 4. Update Transaction status to 'paid'
            const { error: updateTxError } = await supabase
                .from('transactions')
                .update({ status: 'paid', updated_at: new Date().toISOString() })
                .eq('id', transaction.id);

            if (updateTxError) {
                console.error('Failed to update transaction status:', updateTxError);
                throw new Error(`Failed to update transaction status: ${updateTxError.message}`);
            }

            // 5. Increment User Balance via RPC
            console.log(`Attempting to add ${transaction.linh_thach} Linh Thạch to user ${transaction.user_id}`);
            const { error: updateProfileError } = await supabase.rpc('increment_linh_thach', {
                user_id: transaction.user_id,
                amount: transaction.linh_thach
            });

            if (updateProfileError) {
                console.warn('increment_linh_thach RPC failed, falling back to manual update. Error:', updateProfileError.message);

                // Fallback: Manual update if RPC fails
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('linh_thach')
                    .eq('id', transaction.user_id)
                    .single();

                if (profileError) {
                    console.error('Manual update error: Profile not found', profileError);
                } else if (profile) {
                    const { error: manualUpdateError } = await supabase
                        .from('profiles')
                        .update({
                            linh_thach: (profile.linh_thach || 0) + transaction.linh_thach,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', transaction.user_id);

                    if (manualUpdateError) {
                        console.error('Manual balance update failed:', manualUpdateError);
                    } else {
                        console.log('Manual balance update success');
                    }
                }
            } else {
                console.log('RPC balance update success');
            }

            console.log(`Successfully completed auto-topup for user ${transaction.user_id}`);
        } else {
            console.log('Webhook indicated unsuccessful payment or code mismatch. Code:', webhookData.code);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('PayOS Webhook Exception:', error);
        // We still return 200/500 depending on use case, 
        // but PayOS retries on non-2xx.
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    } finally {
        console.log('--- PAYOS WEBHOOK END ---');
    }
}
