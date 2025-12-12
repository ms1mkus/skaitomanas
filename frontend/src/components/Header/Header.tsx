import { Container, Group, Burger, Drawer, Stack, Button, Title, Menu, Avatar, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBook, IconLogout, IconHeart, IconDashboard, IconChartBar } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import classes from './Header.module.css';
import { useAuth } from '../../context/AuthContext';

export function Header() {
    const [opened, { toggle, close }] = useDisclosure(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
        close();
    };

    const getLinks = () => {
        const baseLinks = [
            { link: '/', label: 'Pagrindinis' },
            { link: '/books', label: 'Knygos' },
        ];

        if (user?.role === 'user') {
            baseLinks.push({ link: '/collection', label: 'Mano kolekcija' });
        }

        if (user?.role === 'author') {
            baseLinks.push(
                { link: '/author/books', label: 'Mano knygos' },
                { link: '/author/stats', label: 'Statistika' }
            );
        }

        return baseLinks;
    };

    const items = getLinks().map((link) => (
        <a
            key={link.label}
            href={link.link}
            className={classes.link}
            onClick={(event) => {
                event.preventDefault();
                navigate(link.link);
                close();
            }}
        >
            {link.label}
        </a>
    ));

    return (
        <header className={classes.header}>
            <Container size="md" className={classes.inner}>
                <Group gap={5} visibleFrom="xs" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <IconBook size={28} />
                    <Title order={3}>Skaitomanas</Title>
                </Group>

                <Group gap={5} hiddenFrom="xs">
                    <IconBook size={28} />
                </Group>

                <Group gap={5} visibleFrom="xs">
                    {items}
                    {user ? (
                        <Menu shadow="md" width={200}>
                            <Menu.Target>
                                <Button variant="subtle" leftSection={<Avatar size={24} radius="xl" />}>
                                    {user.username}
                                </Button>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Label>Paskyra</Menu.Label>
                                {user.role === 'user' && <Menu.Item leftSection={<IconHeart style={{ width: rem(14), height: rem(14) }} />} onClick={() => navigate('/collection')}>Mano kolekcija</Menu.Item>}
                                {user.role === 'author' && (
                                    <>
                                        <Menu.Item leftSection={<IconDashboard style={{ width: rem(14), height: rem(14) }} />} onClick={() => navigate('/author/books')}>Mano knygos</Menu.Item>
                                        <Menu.Item leftSection={<IconChartBar style={{ width: rem(14), height: rem(14) }} />} onClick={() => navigate('/author/stats')}>Statistika</Menu.Item>
                                    </>
                                )}
                                <Menu.Divider />
                                <Menu.Item color="red" leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />} onClick={handleLogout}>
                                    Atsijungti
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    ) : (
                        <Button variant="light" onClick={() => navigate('/login')}>Prisijungti</Button>
                    )}
                </Group>

                <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />

                <Drawer opened={opened} onClose={close} size="100%" padding="md" title="Meniu" hiddenFrom="xs" zIndex={1000000}>
                    <Stack>
                        {items}
                        {user ? (
                            <Button fullWidth variant="light" color="red" onClick={handleLogout}>Atsijungti</Button>
                        ) : (
                            <Button fullWidth variant="light" onClick={() => { navigate('/login'); close(); }}>Prisijungti</Button>
                        )}
                    </Stack>
                </Drawer>
            </Container>
        </header>
    );
}
