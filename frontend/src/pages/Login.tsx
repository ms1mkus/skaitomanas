import { Container, Title, TextInput, PasswordInput, Button, Paper, Text, Anchor, Alert } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { client } from '../api/client';
import { IconAlertCircle } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';

const loginSchema = z.object({
    email: z.string().min(1, 'El. paštas privalomas').email('Neteisingas el. pašto formatas'),
    password: z.string().min(1, 'Slaptažodis privalomas'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setError('');
        setLoading(true);

        try {
            const response = await client.post('/auth/login', data);
            const { accessToken, refreshToken, user } = response.data.data;
            login(accessToken, refreshToken, user);
            navigate('/books');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Nepavyko prisijungti');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size={420} my={40}>
            <Title ta="center">Prisijungti</Title>
            <Text c="dimmed" size="sm" ta="center" mt={5}>
                Neturite paskyros?{' '}
                <Anchor size="sm" component="button" onClick={() => navigate('/register')}>
                    Registruotis
                </Anchor>
            </Text>

            <Paper withBorder shadow="md" p={30} mt={30} radius="md" component="form" onSubmit={handleSubmit(onSubmit)}>
                {error && (
                    <Alert icon={<IconAlertCircle size={16} />} title="Klaida" color="red" mb="md">
                        {error}
                    </Alert>
                )}
                <TextInput
                    label="El. paštas"
                    placeholder="jus@pastas.lt"
                    {...register('email')}
                    error={errors.email?.message}
                />
                <PasswordInput
                    label="Slaptažodis"
                    placeholder="Jūsų slaptažodis"
                    mt="md"
                    {...register('password')}
                    error={errors.password?.message}
                />
                <Button fullWidth mt="xl" type="submit" loading={loading}>Prisijungti</Button>
            </Paper>
        </Container>
    );
}
