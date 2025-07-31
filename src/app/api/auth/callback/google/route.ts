
import { handleAuthorizationCode } from '@/lib/auth';
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error');

    if (error) {
        console.error('Error during Google OAuth:', error);
        return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
    }

    if (typeof code === 'string') {
        await handleAuthorizationCode(code);
        return NextResponse.redirect(new URL('/', request.url));
    } else {
        console.error('No authorization code provided.');
        return NextResponse.redirect(new URL('/?error=no_code', request.url));
    }
}
