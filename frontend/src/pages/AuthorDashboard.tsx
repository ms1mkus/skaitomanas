import { Container, Title, Button, Table, Group, Badge, ActionIcon, Modal, TextInput, Textarea, Select, Loader, Center, Stack, FileInput, Image, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { client, API_URL } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { IconEdit, IconTrash, IconPlus, IconUpload } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const bookSchema = z.object({
    title: z.string().min(1, 'Pavadinimas privalomas').max(500, 'Pavadinimas per ilgas'),
    description: z.string().optional(),
    cover_image_url: z.string().url('Neteisingas URL formatas').optional().or(z.literal('')),
    language: z.string().min(1, 'Kalba privaloma'),
    status: z.enum(['draft', 'published']),
    tags: z.string().optional(),
});

type BookFormData = z.infer<typeof bookSchema>;

export function AuthorDashboard() {
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [opened, { open, close }] = useDisclosure(false);

    // Form state
    const [editingBookId, setEditingBookId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [coverUrl, setCoverUrl] = useState('');

    const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm<BookFormData>({
        resolver: zodResolver(bookSchema),
        defaultValues: {
            title: '',
            description: '',
            cover_image_url: '',
            language: 'lt',
            status: 'draft',
            tags: '',
        }
    });

    // Watch cover_image_url to update local state for display if needed, 
    // or just use watch('cover_image_url') in render.
    // But we have custom upload logic that sets coverUrl state, so we need to sync them.
    // Actually, let's make handleFileUpload update the form value directly.

    useEffect(() => {
        fetchMyBooks();
    }, []);

    const fetchMyBooks = async () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(userStr);
        if (user.role !== 'author') {
            navigate('/');
            return;
        }

        try {
            const response = await client.get('/books/my-books');
            setBooks(response.data.data.books);
        } catch (err) {
            console.error('Failed to fetch books', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File | null) => {
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await client.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const relativeUrl = response.data.data.url;
            const fullUrl = `${API_URL}${relativeUrl}`;
            setCoverUrl(fullUrl);
            setValue('cover_image_url', fullUrl);
        } catch (err) {
            console.error('Failed to upload image', err);
            alert('Nepavyko įkelti nuotraukos');
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = async (data: BookFormData) => {
        const bookData = {
            ...data,
            tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(t => t) : [],
            cover_image_url: coverUrl || data.cover_image_url, // Prioritize uploaded url
        };

        try {
            if (editingBookId) {
                await client.patch(`/ books / ${editingBookId} `, bookData);
            } else {
                await client.post('/books', bookData);
            }
            close();
            fetchMyBooks();
            resetForm();
        } catch (err) {
            console.error('Failed to save book', err);
            alert('Nepavyko išsaugoti knygos');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Ar tikrai norite ištrinti šią knygą?')) return;
        try {
            await client.delete(`/ books / ${id} `);
            fetchMyBooks();
        } catch (err) {
            console.error('Failed to delete book', err);
            alert('Nepavyko ištrinti knygos');
        }
    };

    const openEdit = (book: any) => {
        setEditingBookId(book.id);
        const url = book.cover_image_url || '';
        const fullUrl = url.startsWith('/') ? `${API_URL}${url}` : url;
        setCoverUrl(fullUrl);
        reset({
            title: book.title,
            description: book.description || '',
            cover_image_url: fullUrl,
            language: book.language,
            status: book.status,
            tags: book.tags ? book.tags.join(', ') : '',
        });
        open();
    };

    const resetForm = () => {
        setEditingBookId(null);
        setCoverUrl('');
        reset({
            title: '',
            description: '',
            cover_image_url: '',
            language: 'lt',
            status: 'draft',
            tags: '',
        });
    };

    if (loading) {
        return <Center h="50vh"><Loader /></Center>;
    }

    return (
        <Container size="lg" py="xl">
            <Group justify="space-between" mb="xl">
                <Title order={2}>Mano knygos</Title>
                <Button leftSection={<IconPlus size={16} />} onClick={() => { resetForm(); open(); }}>
                    Nauja knyga
                </Button>
            </Group>

            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Pavadinimas</Table.Th>
                        <Table.Th>Būsena</Table.Th>
                        <Table.Th>Kalba</Table.Th>
                        <Table.Th>Veiksmai</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {books.map((book) => (
                        <Table.Tr key={book.id}>
                            <Table.Td>{book.title}</Table.Td>
                            <Table.Td>
                                <Badge color={book.status === 'published' ? 'green' : 'yellow'}>
                                    {book.status === 'published' ? 'Išleista' : 'Juodraštis'}
                                </Badge>
                            </Table.Td>
                            <Table.Td>{book.language}</Table.Td>
                            <Table.Td>
                                <Group gap="xs">
                                    <ActionIcon variant="subtle" color="blue" onClick={() => openEdit(book)}>
                                        <IconEdit size={16} />
                                    </ActionIcon>
                                    <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(book.id)}>
                                        <IconTrash size={16} />
                                    </ActionIcon>
                                    <Button size="xs" variant="light" onClick={() => navigate(`/author/books/${book.id}/chapters`)}>
                                        Skyriai
                                    </Button>
                                </Group >
                            </Table.Td >
                        </Table.Tr >
                    ))}
                </Table.Tbody >
            </Table >

            <Modal opened={opened} onClose={close} title={editingBookId ? "Redaguoti knygą" : "Nauja knyga"}>
                <Stack component="form" onSubmit={handleSubmit(onSubmit)}>
                    <TextInput
                        label="Pavadinimas"
                        required
                        {...register('title')}
                        error={errors.title?.message}
                    />
                    <Textarea
                        label="Aprašymas"
                        {...register('description')}
                        error={errors.description?.message}
                    />

                    <FileInput
                        label="Viršelio nuotrauka"
                        placeholder="Pasirinkite failą"
                        accept="image/png,image/jpeg,image/webp"
                        leftSection={<IconUpload size={14} />}
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                    {uploading && <Text size="xs" c="dimmed">Įkeliama...</Text>}
                    {coverUrl && (
                        <Group>
                            <Image src={coverUrl} w={60} h={90} radius="sm" />
                            <Text size="xs" c="dimmed" style={{ wordBreak: 'break-all', flex: 1 }}>{coverUrl}</Text>
                        </Group>
                    )}
                    <TextInput
                        label="Viršelio URL (arba įkelkite aukščiau)"
                        value={coverUrl}
                        onChange={(e) => {
                            setCoverUrl(e.target.value);
                            setValue('cover_image_url', e.target.value);
                        }}
                        error={errors.cover_image_url?.message}
                    />

                    <Controller
                        name="language"
                        control={control}
                        render={({ field }) => (
                            <Select
                                label="Kalba"
                                data={[{ value: 'lt', label: 'Lietuvių' }, { value: 'en', label: 'Anglų' }]}
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.language?.message}
                            />
                        )}
                    />

                    <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                            <Select
                                label="Būsena"
                                data={[{ value: 'draft', label: 'Juodraštis' }, { value: 'published', label: 'Išleista' }]}
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.status?.message}
                            />
                        )}
                    />

                    <TextInput
                        label="Žymos (atskirtos kableliais)"
                        {...register('tags')}
                        error={errors.tags?.message}
                    />
                    <Button type="submit" loading={uploading}>Išsaugoti</Button>
                </Stack>
            </Modal>
        </Container >
    );
}
