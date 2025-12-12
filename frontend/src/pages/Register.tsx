import { Container, Title, TextInput, PasswordInput, Button, Paper, Text, Anchor, Alert, SegmentedControl } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { client } from '../api/client';
import { IconAlertCircle } from '@tabler/icons-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const registerSchema = z.object({
    username: z.string().min(3, 'Vartotojo vardas turi būti bent 3 simbolių'),
    email: z.string().min(1, 'El. paštas privalomas').email('Neteisingas el. pašto formatas'),
    password: z.string().min(6, 'Slaptažodis turi būti bent 6 simbolių'),
    role: z.enum(['user', 'author']),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function Register() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, control, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'user',
        }
    });

    const onSubmit = async (data: RegisterFormData) => {
        setError('');
        setLoading(true);

        try {
            const response = await client.post('/auth/register', data);
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
            navigate('/books');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Nepavyko prisiregistruoti');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size={420} my={40}>
            <Title ta="center">Registracija</Title>
            <Text c="dimmed" size="sm" ta="center" mt={5}>
                Jau turite paskyrą?{' '}
                <Anchor size="sm" component="button" onClick={() => navigate('/login')}>
                    Prisijungti
                </Anchor>
            </Text>

            <Paper withBorder shadow="md" p={30} mt={30} radius="md" component="form" onSubmit={handleSubmit(onSubmit)}>
                {error && (
                    <Alert icon={<IconAlertCircle size={16} />} title="Klaida" color="red" mb="md">
                        {error}
                    </Alert>
                )}
                <TextInput
                    label="Vartotojo vardas"
                    placeholder="Vardenis"
                    {...register('username')}
                    error={errors.username?.message}
                />
                <TextInput
                    label="El. paštas"
                    placeholder="jus@pastas.lt"
                    mt="md"
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
                <Text size="sm" fw={500} mt="md" mb={5}>Registruotis kaip:</Text>
                <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                        <SegmentedControl
                            fullWidth
                            value={field.value}
                            onChange={field.onChange}
                            data={[
                                { label: 'Skaitytojas', value: 'user' },
                                { label: 'Autorius', value: 'author' },
                            ]}
                        />
                    )}
                />

                <Button fullWidth mt="xl" type="submit" loading={loading}>Registruotis</Button>
            </Paper>
        </Container>
    );
}
