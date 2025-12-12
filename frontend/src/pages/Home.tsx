import { Container, Title, Text, Button, Group, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconBook, IconBookmark, IconPencil } from '@tabler/icons-react';

export function Home() {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <Container size="md" py="xl">
            <Stack align="center" gap="xl" mt="xl">
                <IconBook size={64} color="var(--mantine-color-blue-6)" />
                <Title order={1} ta="center">Sveiki atvykę į Skaitomaną</Title>
                <Text c="dimmed" ta="center" maw={500} size="lg">
                    Jūsų asmeninė knygų skaitymo ir valdymo platforma.
                    {user ? ' Tęskite savo kelionę!' : ' Prisijunkite ir pradėkite skaityti jau šiandien.'}
                </Text>

                {user ? (
                    <Group justify="center" mt="md">
                        <Button
                            size="lg"
                            leftSection={<IconBook size={20} />}
                            onClick={() => navigate('/books')}
                        >
                            Naršyti knygas
                        </Button>
                        <Button
                            size="lg"
                            variant="light"
                            leftSection={<IconBookmark size={20} />}
                            onClick={() => navigate('/history')}
                        >
                            Mano istorija
                        </Button>
                        {user.role === 'author' && (
                            <Button
                                size="lg"
                                variant="outline"
                                leftSection={<IconPencil size={20} />}
                                onClick={() => navigate('/author/books')}
                            >
                                Mano knygos
                            </Button>
                        )}
                    </Group>
                ) : (
                    <Group justify="center" mt="md">
                        <Button size="lg" onClick={() => navigate('/books')}>Pradėti skaityti</Button>
                        <Button size="lg" variant="default" onClick={() => navigate('/login')}>Prisijungti</Button>
                    </Group>
                )}
            </Stack>
        </Container>
    );
}
