import { PayOS } from '@payos/node';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const payos = new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY
});

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function syncTransaction(orderId) {
    try {
        console.log(`Checking PayOS status for Order ID: ${orderId}...`);
        const paymentLinkInfo = await payos.paymentRequests.get(orderId);
        console.log('Payment Info:', JSON.stringify(paymentLinkInfo));

        if (paymentLinkInfo.status === 'PAID') {
            console.log('Order is PAID. Syncing to DB...');

            const { data: transaction, error: fetchError } = await supabase
                .from('transactions')
                .select('*')
                .eq('order_id', orderId)
                .single();

            if (fetchError || !transaction) {
                console.error('Transaction not found in local DB.');
                return;
            }

            if (transaction.status === 'paid') {
                console.log('Transaction is already paid in local DB.');
                return;
            }

            // Update local state
            await supabase
                .from('transactions')
                .update({ status: 'paid', updated_at: new Date().toISOString() })
                .eq('id', transaction.id);

            // Increment LT
            const { error: rpcError } = await supabase.rpc('increment_linh_thach', {
                user_id: transaction.user_id,
                amount: transaction.linh_thach
            });

            if (rpcError) {
                console.error('RPC Error:', rpcError);
            } else {
                console.log(`Successfully added ${transaction.linh_thach} Linh Thạch to user ${transaction.user_id}`);
            }
        } else {
            console.log(`Order status is ${paymentLinkInfo.status}. No action taken.`);
        }
    } catch (error) {
        console.error('Sync Error:', error);
    }
}

const orderIds = [692958566, 692567100, 692310806, 692157728, 691895928, 691816467];

async function syncAll() {
    for (const id of orderIds) {
        await syncTransaction(id);
    }
}

syncAll();
