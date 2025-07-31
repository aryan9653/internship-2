
import { handleAuthorizationCode } from '@/lib/auth';
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')

    if (typeof code === 'string') {
        await handleAuthorizationCode(code);
    } else {
        // Handle error, maybe redirect to an error page
        console.error('No authorization code provided.');
    }
}
