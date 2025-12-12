import { Container, Title, Text, Button, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export function Home() {
    const navigate = useNavigate();

    return (
        <Container size="md" py="xl">
            <Title order={1} ta="center" mt="xl">Sveiki atvykę į Skaitomaną</Title>
            <Text c="dimmed" ta="center" mt="md" maw={500} mx="auto">
                Jūsų asmeninė knygų skaitymo ir valdymo platforma. Prisijunkite ir pradėkite skaityti jau šiandien.
            </Text>
            <Group justify="center" mt="xl">
                <Button size="lg" onClick={() => navigate('/books')}>Pradėti skaityti</Button>
                <Button size="lg" variant="default" onClick={() => navigate('/login')}>Prisijungti</Button>
            </Group>
        </Container>
    );
}
