import { Modal, Text, Button, Group, Image, Badge, Stack, Loader, Center, Divider, SimpleGrid, Card } from '@mantine/core';
import { useEffect, useState } from 'react';
import { client, API_URL } from '../../api/client';
import { useNavigate } from 'react-router-dom';

interface BookModalProps {
    opened: boolean;
    onClose: () => void;
    bookId: string | null;
}

interface Chapter {
    id: string;
    title: string;
    order_index: number;
}

interface BookDetails {
    id: string;
    title: string;
    description: string;
    cover_image_url?: string;
    author_username: string;
    status: 'draft' | 'published';
    chapters?: Chapter[];
}

interface RecommendedBook {
    id: string;
    title: string;
    cover_image_url?: string;
    author_username: string;
}

import { useAuth } from '../../context/AuthContext';

export function BookModal({ opened, onClose, bookId }: BookModalProps) {
    const [book, setBook] = useState<BookDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<RecommendedBook[]>([]);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isInCollection, setIsInCollection] = useState(false);

    useEffect(() => {
        if (!opened) {
            setBook(null);
            setIsInCollection(false);
        }
    }, [opened]);

    useEffect(() => {
        setIsInCollection(false);
        setBook(null);
    }, [bookId]);

    useEffect(() => {
        if (bookId && opened) {
            fetchBookDetails();
            fetchRecommendations();
        }
    }, [bookId, opened]);

    useEffect(() => {
        if (bookId && opened && user) {
            checkCollectionStatus();
        }
    }, [bookId, opened, user]);

    const checkCollectionStatus = async () => {
        if (!user || !bookId) {
            console.log('Skipping checkCollectionStatus', { user: !!user, bookId });
            return;
        }
        try {
            console.log('Checking collection status for', bookId);
            const response = await client.get(`/users/${user.id}/collections`);
            // Backend returns { books: [...] } inside data
            const books = response.data.data.books || [];
            const isFav = books.some((b: any) => b.id == bookId);
            console.log('Collection check result:', isFav, 'Books count:', books.length);
            setIsInCollection(isFav);
        } catch (error) {
            console.error('Failed to check collection status', error);
        }
    };

    const fetchBookDetails = async () => {
        if (!bookId) return;
        setLoading(true);
        try {
            const response = await client.get(`/books/${bookId}`);
            setBook({ ...response.data.data.book, chapters: response.data.data.chapters });
        } catch (error) {
            console.error('Failed to fetch book details', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendations = async () => {
        if (!bookId) return;
        try {
            const response = await client.get(`/books/${bookId}/recommendations`);
            setRecommendations(response.data.data.recommendations || []);
        } catch (error) {
            console.error('Failed to fetch recommendations', error);
        }
    };

    const [toggling, setToggling] = useState(false);

    const handleCollectionToggle = async () => {
        if (!user || !bookId || toggling) return;
        setToggling(true);
        try {
            if (isInCollection) {
                try {
                    await client.delete(`/users/${user.id}/collections/${bookId}`);
                } catch (error: any) {
                    // If 404, it's already removed, so we consider it success
                    if (error.response?.status !== 404) {
                        throw error;
                    }
                }
                setIsInCollection(false);
            } else {
                await client.post(`/users/${user.id}/collections`, { book_id: bookId });
                setIsInCollection(true);
            }
        } catch (error) {
            console.error('Failed to update collection', error);
        } finally {
            setToggling(false);
        }
    };

    const handleRecommendationClick = () => {
        onClose();
        setTimeout(() => {
            navigate(`/books`);
        }, 100);
    };

    if (!bookId) return null;

    return (
        <Modal opened={opened} onClose={onClose} title={book?.title || 'Kraunama...'} size="xl" centered>
            {loading || !book ? (
                <Center h={200}>
                    <Loader />
                </Center>
            ) : (
                <Stack>
                    <Group align="flex-start">
                        <Image
                            src={book.cover_image_url ? (book.cover_image_url.startsWith('/') ? `${API_URL}${book.cover_image_url}` : book.cover_image_url) : `https://placehold.co/140x200?text=${encodeURIComponent(book.title)}`}
                            w={140}
                            h={200}
                            radius="md"
                            fit="cover"
                        />
                        <Stack style={{ flex: 1 }}>
                            <Group justify="space-between">
                                <Text fw={700} size="xl">{book.title}</Text>
                                <Badge color={book.status === 'published' ? 'green' : 'yellow'}>
                                    {book.status === 'published' ? 'Išleista' : 'Juodraštis'}
                                </Badge>
                            </Group>
                            <Text c="dimmed">Autorius: {book.author_username}</Text>
                            <Text size="sm">
                                {book.description || 'Nėra aprašymo'}
                            </Text>

                            <Text fw={600} mt="md">Skyriai:</Text>
                            {book.chapters && book.chapters.length > 0 ? (
                                <Stack gap="xs">
                                    {book.chapters.sort((a, b) => a.order_index - b.order_index).map((chapter) => (
                                        <Button
                                            key={chapter.id}
                                            variant="subtle"
                                            justify="space-between"
                                            fullWidth
                                            onClick={() => {
                                                onClose();
                                                navigate(`/books/${bookId}/chapters/${chapter.id}`);
                                            }}
                                        >
                                            {chapter.title}
                                        </Button>
                                    ))}
                                </Stack>
                            ) : (
                                <Text c="dimmed" size="sm">Skyrių nėra.</Text>
                            )}

                            <Group mt="md">
                                <Button onClick={onClose} variant="default">Uždaryti</Button>
                                {user && user.role === 'user' && (
                                    <Button
                                        variant={isInCollection ? "filled" : "light"}
                                        color={isInCollection ? "red" : "blue"}
                                        loading={toggling}
                                        onClick={handleCollectionToggle}
                                    >
                                        {isInCollection ? 'Pašalinti iš mėgstamiausių' : 'Pridėti į mėgstamiausius'}
                                    </Button>
                                )}
                            </Group>
                        </Stack>
                    </Group>

                    {recommendations.length > 0 && (
                        <>
                            <Divider my="md" label="Panašios knygos" labelPosition="center" />
                            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
                                {recommendations.slice(0, 4).map((rec) => (
                                    <Card
                                        key={rec.id}
                                        shadow="xs"
                                        padding="xs"
                                        radius="md"
                                        withBorder
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleRecommendationClick()}
                                    >
                                        <Card.Section>
                                            <Image
                                                src={rec.cover_image_url ? (rec.cover_image_url.startsWith('/') ? `${API_URL}${rec.cover_image_url}` : rec.cover_image_url) : `https://placehold.co/150x200?text=${encodeURIComponent(rec.title)}`}
                                                height={100}
                                                alt={rec.title}
                                            />
                                        </Card.Section>
                                        <Text size="xs" fw={500} mt="xs" lineClamp={2}>{rec.title}</Text>
                                        <Text size="xs" c="dimmed" lineClamp={1}>{rec.author_username}</Text>
                                    </Card>
                                ))}
                            </SimpleGrid>
                        </>
                    )}
                </Stack>
            )}
        </Modal>
    );
}
