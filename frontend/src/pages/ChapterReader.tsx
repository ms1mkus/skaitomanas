import { Container, Title, Text, Paper, Button, Group, Loader, Center, Stack, Divider, Textarea, ActionIcon, Modal } from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { client } from '../api/client';
import { IconArrowLeft, IconEdit, IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import './ChapterReader.css';

interface Chapter {
    id: string;
    title: string;
    content: string;
    order_index: number;
    book_id: string;
}

interface Comment {
    id: string;
    content: string;
    username: string;
    user_id: string;
    created_at: string;
}

export function ChapterReader() {
    const { bookId, chapterId } = useParams();
    const navigate = useNavigate();
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [user, setUser] = useState<any>(null);
    const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
    const [editingComment, setEditingComment] = useState<Comment | null>(null);
    const [editContent, setEditContent] = useState('');

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

    const handleEditComment = (comment: Comment) => {
        setEditingComment(comment);
        setEditContent(comment.content);
        openEdit();
    };

    const handleSaveEdit = async () => {
        if (!editingComment || !editContent.trim()) return;
        try {
            await client.patch(`/comments/${editingComment.id}`, { content: editContent });
            closeEdit();
            setEditingComment(null);
            fetchComments();
        } catch (err) {
            console.error('Failed to update comment', err);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!window.confirm('Ar tikrai norite ištrinti šį komentarą?')) return;
        try {
            await client.delete(`/comments/${commentId}`);
            fetchComments();
        } catch (err) {
            console.error('Failed to delete comment', err);
        }
    };

    const canModifyComment = (comment: Comment) => {
        if (!user) return false;
        return comment.user_id === user.id || user.role === 'admin';
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

            <Paper p="xl" shadow="sm" radius="md" withBorder mb="xl" className="chapter-reader-content">
                <Title order={2} ta="center" mb="lg" style={{ fontFamily: 'Georgia, serif' }}>{chapter.title}</Title>
                <Divider mb="xl" />
                <div
                    className="chapter-html-content"
                    style={{
                        fontFamily: 'Georgia, serif',
                        fontSize: '1.125rem',
                        lineHeight: 1.9,
                        maxWidth: 700,
                        margin: '0 auto',
                    }}
                    dangerouslySetInnerHTML={{ __html: chapter.content }}
                />
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
                                <Group gap="xs">
                                    <Text size="xs" c="dimmed">{new Date(comment.created_at).toLocaleDateString()}</Text>
                                    {canModifyComment(comment) && (
                                        <>
                                            <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => handleEditComment(comment)}>
                                                <IconEdit size={14} />
                                            </ActionIcon>
                                            <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDeleteComment(comment.id)}>
                                                <IconTrash size={14} />
                                            </ActionIcon>
                                        </>
                                    )}
                                </Group>
                            </Group>
                            <Text size="sm" style={{ lineHeight: 1.5 }}>{comment.content}</Text>
                        </Paper>
                    </Group>
                ))}

                {comments.length === 0 && <Text c="dimmed" ta="center" size="sm">Komentarų dar nėra.</Text>}
            </Stack>

            <Modal opened={editOpened} onClose={closeEdit} title="Redaguoti komentarą">
                <Stack>
                    <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        minRows={3}
                        autosize
                    />
                    <Group justify="flex-end">
                        <Button variant="default" onClick={closeEdit}>Atšaukti</Button>
                        <Button onClick={handleSaveEdit} disabled={!editContent.trim()}>Išsaugoti</Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    );
}
