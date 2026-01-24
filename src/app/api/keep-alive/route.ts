import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseInstance } from '@/lib/supabaseSingletonServer';

export async function GET(request: NextRequest) {
    try {
        const supabase = await getSupabaseInstance();

        // Simple query to keep the database active
        const { data, error } = await supabase
            .from('token_usage')
            .select('count')
            .limit(1);

        if (error) {
            console.error('Supabase keep-alive error:', error);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Database connection failed',
                    timestamp: new Date().toISOString()
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Database kept alive',
            timestamp: new Date().toISOString(),
            data: 'Connection successful'
        });

    } catch (error) {
        console.error('Keep-alive endpoint error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}
