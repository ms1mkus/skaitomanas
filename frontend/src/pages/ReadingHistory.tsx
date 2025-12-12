import { Container, Title, Table, Text, Loader, Center, Button, Group, Badge, Progress } from '@mantine/core';
import { useEffect, useState } from 'react';
import { client } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { IconBook } from '@tabler/icons-react';

interface HistoryItem {
    book_id: string;
    book_title: string;
    chapter_id: string;
    chapter_title: string;
    chapter_number: number;
    last_read_at: string;
    words_read: number;
    total_words: number;
}

export function ReadingHistory() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(userStr);

        try {
            const response = await client.get(`/users/${user.id}/history`);
            setHistory(response.data.data.history || []);
        } catch (err) {
            console.error('Failed to fetch history', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('lt-LT', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getProgressPercent = (wordsRead: number, totalWords: number) => {
        if (!totalWords || totalWords === 0) return 0;
        return Math.min(100, Math.round((wordsRead / totalWords) * 100));
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
            <Group mb="xl">
                <IconBook size={32} />
                <Title order={2}>Skaitymo istorija</Title>
            </Group>

            {history.length === 0 ? (
                <Text c="dimmed" ta="center" mt="xl">
                    Jūs dar neskaitėte jokių knygų.
                    <Button variant="subtle" onClick={() => navigate('/books')}>
                        Naršyti knygas
                    </Button>
                </Text>
            ) : (
                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Knyga</Table.Th>
                            <Table.Th>Paskutinis skyrius</Table.Th>
                            <Table.Th>Progresas</Table.Th>
                            <Table.Th>Paskutinis skaitymas</Table.Th>
                            <Table.Th></Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {history.map((item) => {
                            const progress = getProgressPercent(item.words_read, item.total_words);
                            return (
                                <Table.Tr key={item.book_id}>
                                    <Table.Td>
                                        <Text fw={600}>{item.book_title}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap="xs">
                                            <Badge variant="light" size="sm">#{item.chapter_number}</Badge>
                                            <Text size="sm">{item.chapter_title}</Text>
                                        </Group>
                                    </Table.Td>
                                    <Table.Td style={{ minWidth: 180 }}>
                                        <Progress.Root size="lg">
                                            <Progress.Section value={progress} color={progress === 100 ? 'green' : 'blue'}>
                                                <Progress.Label>{progress}%</Progress.Label>
                                            </Progress.Section>
                                        </Progress.Root>
                                        <Text size="xs" c="dimmed" mt={4}>
                                            {item.words_read.toLocaleString()} / {item.total_words.toLocaleString()} žodžių
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" c="dimmed">{formatDate(item.last_read_at)}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Button
                                            size="xs"
                                            variant="light"
                                            onClick={() => navigate(`/books/${item.book_id}/chapters/${item.chapter_id}`)}
                                        >
                                            Tęsti
                                        </Button>
                                    </Table.Td>
                                </Table.Tr>
                            );
                        })}
                    </Table.Tbody>
                </Table>
            )}
        </Container>
    );
}
