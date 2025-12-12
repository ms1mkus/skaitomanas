import { Container, Title, SimpleGrid, Card, Image, Text, Badge, Group, Button, Loader, Center } from '@mantine/core';
import { useEffect, useState } from 'react';
import { client, API_URL } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { BookModal } from '../components/BookModal/BookModal';
import { useDisclosure } from '@mantine/hooks';

export function Collection() {
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [opened, { open, close }] = useDisclosure(false);
    const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

    useEffect(() => {
        fetchCollection();
    }, []);

    const fetchCollection = async () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(userStr);

        try {
            const response = await client.get(`/users/${user.id}/collections`);
            setBooks(response.data.data.books);
        } catch (err) {
            console.error('Failed to fetch collection', err);
            setError('Nepavyko užkrauti kolekcijos');
        } finally {
            setLoading(false);
        }
    };

    const openBook = (id: string) => {
        setSelectedBookId(id);
        open();
    };

    if (loading) {
        return (
            <Center h="50vh">
                <Loader />
            </Center>
        );
    }

    return (
        <Container size="lg" py="xl">
            <Title order={2} mb="xl">Mano kolekcija</Title>

            {error && <Text c="red" mb="md">{error}</Text>}

            {books.length === 0 ? (
                <Text c="dimmed" ta="center" mt="xl">Jūsų kolekcija tuščia. Pridėkite knygų iš katalogo!</Text>
            ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
                    {books.map((book) => (
                        <Card key={book.id} shadow="sm" padding="lg" radius="md" withBorder>
                            <Card.Section>
                                <Image
                                    src={book.cover_image_url ? (book.cover_image_url.startsWith('/') ? `${API_URL}${book.cover_image_url}` : book.cover_image_url) : `https://placehold.co/300x400?text=${encodeURIComponent(book.title)}`}
                                    height={160}
                                    alt={book.title}
                                />
                            </Card.Section>

                            <Group justify="space-between" mt="md" mb="xs">
                                <Text fw={500} truncate>{book.title}</Text>
                                <Badge color={book.status === 'published' ? 'green' : 'yellow'}>
                                    {book.status === 'published' ? 'Išleista' : 'Juodraštis'}
                                </Badge>
                            </Group>

                            <Text size="sm" c="dimmed" lineClamp={3}>
                                {book.description || 'Nėra aprašymo'}
                            </Text>

                            <Button color="blue" fullWidth mt="md" radius="md" onClick={() => openBook(book.id)}>
                                Skaityti
                            </Button>
                        </Card>
                    ))}
                </SimpleGrid>
            )}

            <BookModal opened={opened} onClose={() => { close(); fetchCollection(); }} bookId={selectedBookId} />
        </Container>
    );
}
