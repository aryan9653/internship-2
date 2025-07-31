
'use server';

import 'dotenv/config'
import { google } from 'googleapis';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { OAuth2Client } from 'google-auth-library';

const OAUTH2_CLIENT = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.file'
];

export async function getAuthorizationUrl(): Promise<string> {
    return OAUTH2_CLIENT.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
    });
}

export async function getOAuth2Client(): Promise<OAuth2Client | null> {
    const cookieStore = cookies();
    const tokens = cookieStore.get('google_tokens');

    if (tokens) {
        const client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
        client.setCredentials(JSON.parse(tokens.value));
        
        // Check if the access token is expired, and refresh if needed
        if (client.isTokenExpiring()) {
            try {
                const { credentials } = await client.refreshAccessToken();
                client.setCredentials(credentials);
                // Save new tokens to cookie
                cookieStore.set('google_tokens', JSON.stringify(credentials), {
                    httpOnly: true,
                    secure: process.env.NODE_ENV !== 'development',
                    maxAge: 60 * 60 * 24 * 7, // 1 week
                    path: '/',
                });

            } catch (error) {
                console.error("Error refreshing access token", error);
                // If refresh fails, tokens are invalid, clear them
                cookieStore.delete('google_tokens');
                return null;
            }
        }
        return client;
    }
    return null;
}

export async function handleAuthorizationCode(code: string) {
    const { tokens } = await OAUTH2_CLIENT.getToken(code);
    OAUTH2_CLIENT.setCredentials(tokens);

    cookies().set('google_tokens', JSON.stringify(tokens), {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    });
    
    redirect('/');
}

export async function clearAuth() {
    cookies().delete('google_tokens');
}
