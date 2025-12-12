import { Container, Title, SimpleGrid, Paper, Text, Group, Loader, Center } from '@mantine/core';
import { useEffect, useState } from 'react';
import { client } from '../api/client';
import { IconEye, IconMessage, IconBook } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export function AuthorStats() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
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
            const response = await client.get(`/authors/${user.id}/stats`);
            setStats(response.data.data.stats);
        } catch (err) {
            console.error('Failed to fetch stats', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Center h="50vh"><Loader /></Center>;
    }

    if (!stats) {
        return <Container><Text>Nepavyko užkrauti statistikos.</Text></Container>;
    }

    return (
        <Container size="lg" py="xl">
            <Title order={2} mb="xl">Autoriaus statistika</Title>

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                <Paper p="md" shadow="sm" radius="md" withBorder>
                    <Group>
                        <IconBook size={32} color="blue" />
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Viso knygų</Text>
                            <Text fw={700} size="xl">{stats.total_books}</Text>
                        </div>
                    </Group>
                </Paper>

                <Paper p="md" shadow="sm" radius="md" withBorder>
                    <Group>
                        <IconEye size={32} color="green" />
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Viso peržiūrų</Text>
                            <Text fw={700} size="xl">{stats.total_readers}</Text>
                        </div>
                    </Group>
                </Paper>

                <Paper p="md" shadow="sm" radius="md" withBorder>
                    <Group>
                        <IconMessage size={32} color="orange" />
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Viso komentarų</Text>
                            <Text fw={700} size="xl">{stats.total_comments}</Text>
                        </div>
                    </Group>
                </Paper>
            </SimpleGrid>

            {/* Future: Charts or detailed breakdown */}
        </Container>
    );
}
