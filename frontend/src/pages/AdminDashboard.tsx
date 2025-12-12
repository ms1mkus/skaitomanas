import { Container, Title, SimpleGrid, Paper, Text, Group, Tabs, Table, Badge, ActionIcon, Loader, Center, Stack } from '@mantine/core';
import { useEffect, useState } from 'react';
import { client } from '../api/client';
import { IconUsers, IconBook, IconMessage, IconFileText, IconTrash, IconShield } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Stats {
    totalUsers: number;
    totalBooks: number;
    totalChapters: number;
    totalComments: number;
    usersByRole: { role: string; count: number }[];
}

interface User {
    id: string;
    email: string;
    username: string;
    role: string;
    created_at: string;
    book_count: number;
    comment_count: number;
}

interface Book {
    id: string;
    title: string;
    status: string;
    author_username: string;
    chapter_count: number;
    total_words: number;
    created_at: string;
}

interface Comment {
    id: string;
    content: string;
    username: string;
    book_title: string;
    chapter_title: string;
    created_at: string;
}

export function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<Stats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string | null>('overview');

    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const [statsRes, usersRes, booksRes, commentsRes] = await Promise.all([
                client.get('/admin/stats'),
                client.get('/admin/users'),
                client.get('/admin/books'),
                client.get('/admin/comments'),
            ]);
            setStats(statsRes.data.data.stats);
            setUsers(usersRes.data.data.users);
            setBooks(booksRes.data.data.books);
            setComments(commentsRes.data.data.comments);
        } catch (err) {
            console.error('Failed to fetch admin data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('Ar tikrai norite ištrinti šį vartotoją? Bus ištrinti visi jo duomenys.')) return;
        try {
            await client.delete(`/admin/users/${userId}`);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            console.error('Failed to delete user', err);
            alert('Nepavyko ištrinti vartotojo');
        }
    };

    const handleDeleteBook = async (bookId: string) => {
        if (!window.confirm('Ar tikrai norite ištrinti šią knygą?')) return;
        try {
            await client.delete(`/admin/books/${bookId}`);
            setBooks(books.filter(b => b.id !== bookId));
        } catch (err) {
            console.error('Failed to delete book', err);
            alert('Nepavyko ištrinti knygos');
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!window.confirm('Ar tikrai norite ištrinti šį komentarą?')) return;
        try {
            await client.delete(`/admin/comments/${commentId}`);
            setComments(comments.filter(c => c.id !== commentId));
        } catch (err) {
            console.error('Failed to delete comment', err);
            alert('Nepavyko ištrinti komentaro');
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('lt-LT');
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'red';
            case 'author': return 'blue';
            case 'user': return 'green';
            default: return 'gray';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin': return 'Administratorius';
            case 'author': return 'Autorius';
            case 'user': return 'Skaitytojas';
            case 'guest': return 'Svečias';
            default: return role;
        }
    };

    if (loading) {
        return <Center h="50vh"><Loader size="xl" /></Center>;
    }

    return (
        <Container size="xl" py="xl">
            <Group mb="xl">
                <IconShield size={32} color="var(--mantine-color-red-6)" />
                <Title order={2}>Administratoriaus skydelis</Title>
            </Group>

            <Tabs value={activeTab} onChange={setActiveTab}>
                <Tabs.List mb="xl">
                    <Tabs.Tab value="overview" leftSection={<IconFileText size={16} />}>Apžvalga</Tabs.Tab>
                    <Tabs.Tab value="users" leftSection={<IconUsers size={16} />}>Vartotojai</Tabs.Tab>
                    <Tabs.Tab value="books" leftSection={<IconBook size={16} />}>Knygos</Tabs.Tab>
                    <Tabs.Tab value="comments" leftSection={<IconMessage size={16} />}>Komentarai</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="overview">
                    <SimpleGrid cols={{ base: 2, md: 4 }} mb="xl">
                        <Paper p="lg" radius="md" withBorder>
                            <Group>
                                <IconUsers size={32} color="var(--mantine-color-blue-6)" />
                                <div>
                                    <Text size="xl" fw={700}>{stats?.totalUsers || 0}</Text>
                                    <Text size="sm" c="dimmed">Vartotojų</Text>
                                </div>
                            </Group>
                        </Paper>
                        <Paper p="lg" radius="md" withBorder>
                            <Group>
                                <IconBook size={32} color="var(--mantine-color-green-6)" />
                                <div>
                                    <Text size="xl" fw={700}>{stats?.totalBooks || 0}</Text>
                                    <Text size="sm" c="dimmed">Knygų</Text>
                                </div>
                            </Group>
                        </Paper>
                        <Paper p="lg" radius="md" withBorder>
                            <Group>
                                <IconFileText size={32} color="var(--mantine-color-orange-6)" />
                                <div>
                                    <Text size="xl" fw={700}>{stats?.totalChapters || 0}</Text>
                                    <Text size="sm" c="dimmed">Skyrių</Text>
                                </div>
                            </Group>
                        </Paper>
                        <Paper p="lg" radius="md" withBorder>
                            <Group>
                                <IconMessage size={32} color="var(--mantine-color-violet-6)" />
                                <div>
                                    <Text size="xl" fw={700}>{stats?.totalComments || 0}</Text>
                                    <Text size="sm" c="dimmed">Komentarų</Text>
                                </div>
                            </Group>
                        </Paper>
                    </SimpleGrid>

                    <Paper p="lg" radius="md" withBorder>
                        <Title order={4} mb="md">Vartotojai pagal vaidmenį</Title>
                        <Group>
                            {stats?.usersByRole.map(r => (
                                <Badge key={r.role} size="xl" color={getRoleBadgeColor(r.role)}>
                                    {getRoleLabel(r.role)}: {r.count}
                                </Badge>
                            ))}
                        </Group>
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="users">
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Vartotojas</Table.Th>
                                <Table.Th>El. paštas</Table.Th>
                                <Table.Th>Vaidmuo</Table.Th>
                                <Table.Th>Knygų</Table.Th>
                                <Table.Th>Komentarų</Table.Th>
                                <Table.Th>Registracija</Table.Th>
                                <Table.Th></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {users.map(u => (
                                <Table.Tr key={u.id}>
                                    <Table.Td><Text fw={500}>{u.username}</Text></Table.Td>
                                    <Table.Td><Text size="sm" c="dimmed">{u.email}</Text></Table.Td>
                                    <Table.Td>
                                        <Badge color={getRoleBadgeColor(u.role)}>
                                            {getRoleLabel(u.role)}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>{u.book_count}</Table.Td>
                                    <Table.Td>{u.comment_count}</Table.Td>
                                    <Table.Td>{formatDate(u.created_at)}</Table.Td>
                                    <Table.Td>
                                        <ActionIcon
                                            color="red"
                                            variant="subtle"
                                            onClick={() => handleDeleteUser(u.id)}
                                            disabled={u.id === user?.id}
                                        >
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Tabs.Panel>

                <Tabs.Panel value="books">
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Pavadinimas</Table.Th>
                                <Table.Th>Autorius</Table.Th>
                                <Table.Th>Statusas</Table.Th>
                                <Table.Th>Skyrių</Table.Th>
                                <Table.Th>Žodžių</Table.Th>
                                <Table.Th>Sukurta</Table.Th>
                                <Table.Th></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {books.map(b => (
                                <Table.Tr key={b.id}>
                                    <Table.Td><Text fw={500}>{b.title}</Text></Table.Td>
                                    <Table.Td>{b.author_username}</Table.Td>
                                    <Table.Td>
                                        <Badge color={b.status === 'published' ? 'green' : 'yellow'}>
                                            {b.status === 'published' ? 'Išleista' : 'Juodraštis'}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>{b.chapter_count}</Table.Td>
                                    <Table.Td>{Number(b.total_words).toLocaleString()}</Table.Td>
                                    <Table.Td>{formatDate(b.created_at)}</Table.Td>
                                    <Table.Td>
                                        <ActionIcon color="red" variant="subtle" onClick={() => handleDeleteBook(b.id)}>
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Tabs.Panel>

                <Tabs.Panel value="comments">
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Vartotojas</Table.Th>
                                <Table.Th>Komentaras</Table.Th>
                                <Table.Th>Knyga / Skyrius</Table.Th>
                                <Table.Th>Data</Table.Th>
                                <Table.Th></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {comments.map(c => (
                                <Table.Tr key={c.id}>
                                    <Table.Td><Text fw={500}>{c.username}</Text></Table.Td>
                                    <Table.Td><Text lineClamp={2} size="sm">{c.content}</Text></Table.Td>
                                    <Table.Td>
                                        <Stack gap={0}>
                                            <Text size="sm">{c.book_title}</Text>
                                            <Text size="xs" c="dimmed">{c.chapter_title}</Text>
                                        </Stack>
                                    </Table.Td>
                                    <Table.Td>{formatDate(c.created_at)}</Table.Td>
                                    <Table.Td>
                                        <ActionIcon color="red" variant="subtle" onClick={() => handleDeleteComment(c.id)}>
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
}
