import { Container, Title, SimpleGrid, Card, Image, Text, Badge, Button, Group, Loader, Center, Alert } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import { BookModal } from '../components/BookModal/BookModal';
import { client, API_URL } from '../api/client';
import { IconAlertCircle } from '@tabler/icons-react';

interface Book {
    id: string;
    title: string;
    description: string;
    cover_image_url?: string;
    status: 'draft' | 'published';
}

export function Books() {
    const [opened, { open, close }] = useDisclosure(false);
    const [selectedBook, setSelectedBook] = useState<string | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const response = await client.get('/books');
            setBooks(response.data.data.books);
        } catch (err) {
            console.error(err);
            setError('Nepavyko užkrauti knygų sąrašo');
        } finally {
            setLoading(false);
        }
    };

    const handleBookClick = (id: string) => {
        setSelectedBook(id);
        open();
    };

    if (loading) {
        return (
            <Center h={400}>
                <Loader size="xl" />
            </Center>
        );
    }

    if (error) {
        return (
            <Container size="lg" py="xl">
                <Alert icon={<IconAlertCircle size={16} />} title="Klaida" color="red">
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container size="lg" py="xl">
            <Title order={2} mb="xl">Knygų katalogas</Title>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                {books.map((book) => (
                    <Card
                        key={book.id}
                        shadow="sm"
                        padding="lg"
                        radius="md"
                        withBorder
                        style={{ transition: 'transform 0.2s ease', cursor: 'pointer' }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                        <Card.Section>
                            <Image
                                src={book.cover_image_url ? (book.cover_image_url.startsWith('/') ? `${API_URL}${book.cover_image_url}` : book.cover_image_url) : `https://placehold.co/600x400?text=${encodeURIComponent(book.title)}`}
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

                        <Button color="blue" fullWidth mt="md" radius="md" onClick={() => handleBookClick(book.id)}>
                            Skaityti
                        </Button>
                    </Card>
                ))}
            </SimpleGrid>
            <BookModal opened={opened} onClose={close} bookId={selectedBook} />
        </Container>
    );
}
