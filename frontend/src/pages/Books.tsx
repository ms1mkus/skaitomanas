import { Container, Title, SimpleGrid, Card, Image, Text, Badge, Button, Group, Loader, Center, Alert, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import { BookModal } from '../components/BookModal/BookModal';
import { client, API_URL } from '../api/client';
import { IconAlertCircle, IconSearch } from '@tabler/icons-react';
import './Books.css';

interface Book {
    id: string;
    title: string;
    description: string;
    cover_image_url?: string;
    status: 'draft' | 'published';
    author_username?: string;
}

export function Books() {
    const [opened, { open, close }] = useDisclosure(false);
    const [selectedBook, setSelectedBook] = useState<string | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

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

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.description?.toLowerCase().includes(search.toLowerCase())
    );

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
            <Group justify="space-between" mb="xl">
                <Title order={2}>Knygų katalogas</Title>
                <TextInput
                    placeholder="Ieškoti knygų..."
                    leftSection={<IconSearch size={16} />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    w={{ base: '100%', sm: 300 }}
                />
            </Group>

            {filteredBooks.length === 0 ? (
                <Text c="dimmed" ta="center" mt="xl">Knygų nerasta</Text>
            ) : (
                <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="lg">
                    {filteredBooks.map((book) => (
                        <Card
                            key={book.id}
                            shadow="sm"
                            padding="md"
                            radius="md"
                            withBorder
                            className="book-card"
                            onClick={() => handleBookClick(book.id)}
                        >
                            <Card.Section className="book-cover-section">
                                <Image
                                    src={book.cover_image_url ? (book.cover_image_url.startsWith('/') ? `${API_URL}${book.cover_image_url}` : book.cover_image_url) : undefined}
                                    fallbackSrc={`https://placehold.co/300x400/1a1b1e/666?text=${encodeURIComponent(book.title.substring(0, 15))}`}
                                    alt={book.title}
                                    className="book-cover-image"
                                />
                            </Card.Section>

                            <Text fw={600} mt="sm" lineClamp={2} size="sm">
                                {book.title}
                            </Text>

                            {book.author_username && (
                                <Text size="xs" c="dimmed" mt={4}>
                                    {book.author_username}
                                </Text>
                            )}

                            <Text size="xs" c="dimmed" lineClamp={2} mt={4}>
                                {book.description || 'Nėra aprašymo'}
                            </Text>
                        </Card>
                    ))}
                </SimpleGrid>
            )}
            <BookModal opened={opened} onClose={close} bookId={selectedBook} />
        </Container>
    );
}
