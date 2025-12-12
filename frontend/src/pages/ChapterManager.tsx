import { Container, Title, Button, Table, Group, ActionIcon, Modal, TextInput, Textarea, Loader, Center, Stack, Checkbox, NumberInput } from '@mantine/core';
import { useEffect, useState } from 'react';
import { client } from '../api/client';
import { useNavigate, useParams } from 'react-router-dom';
import { IconEdit, IconTrash, IconPlus, IconArrowLeft } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

export function ChapterManager() {
    const { bookId } = useParams();
    const [chapters, setChapters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [opened, { open, close }] = useDisclosure(false);

    // Form state
    const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [chapterNumber, setChapterNumber] = useState<number | string>(1);
    const [isPublished, setIsPublished] = useState(true);

    useEffect(() => {
        if (bookId) {
            fetchChapters();
        }
    }, [bookId]);

    const fetchChapters = async () => {
        try {
            const response = await client.get(`/books/${bookId}/chapters`);
            setChapters(response.data.data.chapters);
        } catch (err) {
            console.error('Failed to fetch chapters', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        const chapterData = {
            title,
            content,
            chapter_number: Number(chapterNumber),
            is_published: isPublished
        };

        try {
            if (editingChapterId) {
                await client.patch(`/books/${bookId}/chapters/${editingChapterId}`, chapterData);
            } else {
                await client.post(`/books/${bookId}/chapters`, chapterData);
            }
            close();
            fetchChapters();
            resetForm();
        } catch (err) {
            console.error('Failed to save chapter', err);
            alert('Nepavyko išsaugoti skyriaus');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Ar tikrai norite ištrinti šį skyrių?')) return;
        try {
            await client.delete(`/books/${bookId}/chapters/${id}`);
            fetchChapters();
        } catch (err) {
            console.error('Failed to delete chapter', err);
            alert('Nepavyko ištrinti skyriaus');
        }
    };

    const openEdit = (chapter: any) => {
        setEditingChapterId(chapter.id);
        setTitle(chapter.title);
        setContent(chapter.content);
        setChapterNumber(chapter.chapter_number);
        setIsPublished(chapter.is_published);
        open();
    };

    const resetForm = () => {
        setEditingChapterId(null);
        setTitle('');
        setContent('');
        setChapterNumber(chapters.length + 1);
        setIsPublished(true);
    };

    if (loading) {
        return <Center h="50vh"><Loader /></Center>;
    }

    return (
        <Container size="lg" py="xl">
            <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} mb="md" onClick={() => navigate('/author/books')}>
                Grįžti į knygas
            </Button>

            <Group justify="space-between" mb="xl">
                <Title order={2}>Skyrių valdymas</Title>
                <Button leftSection={<IconPlus size={16} />} onClick={() => { resetForm(); open(); }}>
                    Naujas skyrius
                </Button>
            </Group>

            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Nr.</Table.Th>
                        <Table.Th>Pavadinimas</Table.Th>
                        <Table.Th>Statusas</Table.Th>
                        <Table.Th>Veiksmai</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {chapters.sort((a, b) => a.chapter_number - b.chapter_number).map((chapter) => (
                        <Table.Tr key={chapter.id}>
                            <Table.Td>{chapter.chapter_number}</Table.Td>
                            <Table.Td>{chapter.title}</Table.Td>
                            <Table.Td>{chapter.is_published ? 'Publikuota' : 'Juodraštis'}</Table.Td>
                            <Table.Td>
                                <Group gap="xs">
                                    <ActionIcon variant="subtle" color="blue" onClick={() => openEdit(chapter)}>
                                        <IconEdit size={16} />
                                    </ActionIcon>
                                    <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(chapter.id)}>
                                        <IconTrash size={16} />
                                    </ActionIcon>
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            <Modal opened={opened} onClose={close} title={editingChapterId ? "Redaguoti skyrių" : "Naujas skyrius"} size="lg">
                <Stack>
                    <NumberInput label="Skyriaus numeris" required value={chapterNumber} onChange={setChapterNumber} />
                    <TextInput label="Pavadinimas" required value={title} onChange={(e) => setTitle(e.target.value)} />
                    <Textarea label="Turinys" required minRows={10} value={content} onChange={(e) => setContent(e.target.value)} />
                    <Checkbox label="Publikuoti" checked={isPublished} onChange={(e) => setIsPublished(e.currentTarget.checked)} />
                    <Button onClick={handleSubmit}>Išsaugoti</Button>
                </Stack>
            </Modal>
        </Container>
    );
}
