import { Container, Title, Text, Paper, Button, Group, Loader, Center, Stack, Divider, Textarea } from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { client } from '../api/client';
import { IconArrowLeft } from '@tabler/icons-react';

interface Chapter {
    id: string;
    title: string;
    content: string;
    order_index: number;
    book_id: string;
}

export function ChapterReader() {
    const { bookId, chapterId } = useParams();
    const navigate = useNavigate();
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
    }, []);

    useEffect(() => {
        if (bookId) {
            fetchBookChapters();
        }
    }, [bookId]);

    useEffect(() => {
        if (bookId && chapterId) {
            fetchChapter();
            fetchComments();
            window.scrollTo(0, 0);
        }
    }, [bookId, chapterId]);

    const fetchBookChapters = async () => {
        try {
            const response = await client.get(`/books/${bookId}`);
            setChapters(response.data.data.chapters);
        } catch (err) {
            console.error('Failed to fetch book chapters', err);
        }
    };

    const fetchChapter = async () => {
        setLoading(true);
        try {
            const response = await client.get(`/books/${bookId}/chapters/${chapterId}`);
            setChapter(response.data.data.chapter);
        } catch (err) {
            console.error('Failed to fetch chapter', err);
            setError('Nepavyko užkrauti skyriaus.');
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await client.get(`/chapters/${chapterId}/comments`);
            setComments(response.data.data.comments);
        } catch (err) {
            console.error('Failed to fetch comments', err);
        }
    };

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        try {
            await client.post(`/chapters/${chapterId}/comments`, { content: newComment });
            setNewComment('');
            fetchComments();
        } catch (err) {
            console.error('Failed to post comment', err);
        }
    };

    const sortedChapters = chapters.sort((a, b) => a.order_index - b.order_index);
    const currentIndex = sortedChapters.findIndex(c => c.id === chapterId);
    const prevChapter = sortedChapters[currentIndex - 1];
    const nextChapter = sortedChapters[currentIndex + 1];

    if (loading) {
        return (
            <Center h="100vh">
                <Loader size="lg" />
            </Center>
        );
    }

    if (error || !chapter) {
        return (
            <Container my="xl">
                <Text c="red" ta="center">{error || 'Skyrius nerastas'}</Text>
                <Center mt="md">
                    <Button onClick={() => navigate('/books')}>Grįžti į knygas</Button>
                </Center>
            </Container>
        );
    }

    return (
        <Container size="sm" py="xl">
            <Group justify="space-between" mb="xl">
                <Button
                    variant="subtle"
                    leftSection={<IconArrowLeft size={16} />}
                    onClick={() => navigate('/books')}
                    color="gray"
                >
                    Grįžti
                </Button>
                <Text c="dimmed" size="sm">
                    Skyrius {currentIndex + 1} iš {chapters.length}
                </Text>
            </Group>

            <Paper p="xl" shadow="sm" radius="md" withBorder mb="xl">
                <Title order={2} ta="center" mb="lg" style={{ fontFamily: 'Georgia, serif' }}>{chapter.title}</Title>
                <Divider mb="xl" />
                <Text
                    size="lg"
                    style={{
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.8,
                        fontFamily: 'Georgia, serif',
                    }}
                >
                    {chapter.content}
                </Text>
            </Paper>

            <Group justify="space-between" mb="xl">
                {prevChapter ? (
                    <Button
                        variant="default"
                        onClick={() => navigate(`/books/${bookId}/chapters/${prevChapter.id}`)}
                    >
                        Ankstesnis skyrius
                    </Button>
                ) : <div />}

                {nextChapter ? (
                    <Button
                        size="md"
                        onClick={() => navigate(`/books/${bookId}/chapters/${nextChapter.id}`)}
                    >
                        Kitas skyrius
                    </Button>
                ) : (
                    <Button
                        variant="light"
                        color="green"
                        onClick={() => navigate('/books')}
                    >
                        Baigti skaityti
                    </Button>
                )}
            </Group>

            <Divider my="xl" label="Diskusija" labelPosition="center" />

            <Stack gap="lg">
                {user ? (
                    <Paper p="md" withBorder radius="md">
                        <Text fw={500} mb="xs" size="sm">Jūsų nuomonė:</Text>
                        <Stack gap="xs">
                            <Textarea
                                minRows={3}
                                autosize
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Ką manote apie šį skyrių?"
                            />
                            <Group justify="flex-end">
                                <Button size="xs" onClick={handlePostComment} disabled={!newComment.trim()}>Komentuoti</Button>
                            </Group>
                        </Stack>
                    </Paper>
                ) : (
                    <Paper p="md" withBorder radius="md">
                        <Text ta="center" size="sm">Norėdami komentuoti, <span style={{ color: 'var(--mantine-color-blue-filled)', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/login')}>prisijunkite</span>.</Text>
                    </Paper>
                )}

                {comments.map((comment) => (
                    <Group key={comment.id} align="flex-start" wrap="nowrap">
                        <Paper p="md" withBorder radius="md" style={{ flex: 1 }}>
                            <Group justify="space-between" mb={4}>
                                <Text fw={600} size="sm">{comment.username}</Text>
                                <Text size="xs" c="dimmed">{new Date(comment.created_at).toLocaleDateString()}</Text>
                            </Group>
                            <Text size="sm" style={{ lineHeight: 1.5 }}>{comment.content}</Text>
                        </Paper>
                    </Group>
                ))}

                {comments.length === 0 && <Text c="dimmed" ta="center" size="sm">Komentarų dar nėra.</Text>}
            </Stack>
        </Container>
    );
}

