import { Modal, Text, Button, Group, Image, Badge, Stack, Loader, Center } from '@mantine/core';
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

export function BookModal({ opened, onClose, bookId }: BookModalProps) {
    const [book, setBook] = useState<BookDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isInCollection, setIsInCollection] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
    }, []);

    useEffect(() => {
        if (bookId && opened) {
            fetchBookDetails();
        }
    }, [bookId, opened]);

    useEffect(() => {
        if (bookId && opened && user) {
            checkCollectionStatus();
        }
    }, [bookId, opened, user]);

    const checkCollectionStatus = async () => {
        if (!user || !bookId) return;
        try {
            const response = await client.get(`/users/${user.id}/collections`);
            const collection = response.data.data;
            setIsInCollection(collection.some((b: any) => b.id === bookId));
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

    const handleCollectionToggle = async () => {
        if (!user || !bookId) return;
        try {
            if (isInCollection) {
                await client.delete(`/users/${user.id}/collections/${bookId}`);
                setIsInCollection(false);
            } else {
                await client.post(`/users/${user.id}/collections`, { book_id: bookId });
                setIsInCollection(true);
            }
        } catch (error) {
            console.error('Failed to update collection', error);
        }
    };

    if (!bookId) return null;

    return (
        <Modal opened={opened} onClose={onClose} title={book ? `Knyga: ${book.title}` : 'Kraunama...'} size="lg" centered>
            {loading || !book ? (
                <Center h={200}>
                    <Loader />
                </Center>
            ) : (
                <Group align="flex-start">
                    <Image
                        src={book.cover_image_url ? (book.cover_image_url.startsWith('/') ? `${API_URL}${book.cover_image_url}` : book.cover_image_url) : `https://placehold.co/200x300?text=${encodeURIComponent(book.title)}`}
                        width={200}
                        radius="md"
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
                                    onClick={handleCollectionToggle}
                                >
                                    {isInCollection ? 'Pašalinti iš mėgstamiausių' : 'Pridėti į mėgstamiausius'}
                                </Button>
                            )}
                        </Group>
                    </Stack>
                </Group>
            )}
        </Modal>
    );
}

