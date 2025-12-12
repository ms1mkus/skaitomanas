import { client } from './client';

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        username: string;
        role: 'user' | 'author' | 'admin';
    };
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
    role: 'user' | 'author';
}

export async function login(email: string, password: string): Promise<LoginResponse> {
    const response = await client.post('/auth/login', { email, password });
    return response.data.data;
}

export async function register(data: RegisterData): Promise<LoginResponse> {
    const response = await client.post('/auth/register', data);
    return response.data.data;
}

export async function logout(refreshToken: string): Promise<void> {
    await client.post('/auth/logout', { refreshToken });
}

export async function refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await client.post('/auth/refresh', { refreshToken: token });
    return response.data.data;
}

export async function getMe(): Promise<LoginResponse['user']> {
    const response = await client.get('/auth/me');
    return response.data.data.user;
}
