import { Group, Burger, Drawer, Stack, Button, Title, Menu, Avatar, rem, Divider, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBook, IconLogout, IconHeart, IconDashboard, IconChartBar, IconHistory } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import classes from './Header.module.css';
import { useAuth } from '../../context/AuthContext';

export function Header() {
    const [opened, { toggle, close }] = useDisclosure(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/');
        close();
    };

    const getLinks = () => {
        const baseLinks = [
            { link: '/', label: 'Pagrindinis' },
            { link: '/books', label: 'Knygos' },
        ];

        if (user) {
            baseLinks.push({ link: '/history', label: 'Istorija' });
        }

        if (user?.role === 'user') {
            baseLinks.push({ link: '/collection', label: 'Kolekcija' });
        }

        if (user?.role === 'author') {
            baseLinks.push(
                { link: '/author/books', label: 'Mano knygos' },
                { link: '/author/stats', label: 'Statistika' }
            );
        }

        if (user?.role === 'admin') {
            baseLinks.push({ link: '/admin', label: 'Administravimas' });
        }

        return baseLinks;
    };

    const desktopItems = getLinks().map((link) => (
        <a
            key={link.label}
            href={link.link}
            className={classes.link}
            onClick={(event) => {
                event.preventDefault();
                navigate(link.link);
            }}
        >
            {link.label}
        </a>
    ));

    const mobileItems = getLinks().map((link) => (
        <a
            key={link.label}
            href={link.link}
            className={classes.mobileLink}
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
            <div className={classes.inner}>
                <div className={classes.logo} onClick={() => navigate('/')}>
                    <IconBook size={28} className={classes.logoIcon} />
                    <Title order={3} className={classes.logoText}>Skaitomanas</Title>
                </div>

                <Group gap={4} className={classes.desktopNav}>
                    {desktopItems}
                    {user ? (
                        <Menu shadow="md" width={220} position="bottom-end">
                            <Menu.Target>
                                <Button
                                    variant="subtle"
                                    leftSection={<Avatar size={26} radius="xl" color="blue">{user.username[0].toUpperCase()}</Avatar>}
                                    className={classes.userButton}
                                >
                                    {user.username}
                                </Button>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Label>Paskyra</Menu.Label>
                                <Menu.Item
                                    leftSection={<IconHistory style={{ width: rem(16), height: rem(16) }} />}
                                    onClick={() => navigate('/history')}
                                >
                                    Skaitymo istorija
                                </Menu.Item>
                                {user.role === 'user' && (
                                    <Menu.Item
                                        leftSection={<IconHeart style={{ width: rem(16), height: rem(16) }} />}
                                        onClick={() => navigate('/collection')}
                                    >
                                        Mano kolekcija
                                    </Menu.Item>
                                )}
                                {user.role === 'author' && (
                                    <>
                                        <Menu.Item
                                            leftSection={<IconDashboard style={{ width: rem(16), height: rem(16) }} />}
                                            onClick={() => navigate('/author/books')}
                                        >
                                            Mano knygos
                                        </Menu.Item>
                                        <Menu.Item
                                            leftSection={<IconChartBar style={{ width: rem(16), height: rem(16) }} />}
                                            onClick={() => navigate('/author/stats')}
                                        >
                                            Statistika
                                        </Menu.Item>
                                    </>
                                )}
                                <Menu.Divider />
                                <Menu.Item
                                    color="red"
                                    leftSection={<IconLogout style={{ width: rem(16), height: rem(16) }} />}
                                    onClick={handleLogout}
                                >
                                    Atsijungti
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    ) : (
                        <Group gap={8}>
                            <Button variant="subtle" onClick={() => navigate('/login')}>Prisijungti</Button>
                            <Button variant="filled" onClick={() => navigate('/register')}>Registruotis</Button>
                        </Group>
                    )}
                </Group>

                <div className={classes.mobileNav}>
                    <Burger opened={opened} onClick={toggle} size="sm" />
                </div>

                <Drawer
                    opened={opened}
                    onClose={close}
                    size="100%"
                    padding="xl"
                    title={
                        <Group gap={8}>
                            <IconBook size={24} color="var(--mantine-color-blue-6)" />
                            <Text fw={600}>Skaitomanas</Text>
                        </Group>
                    }
                    zIndex={1000000}
                >
                    <Stack gap="xs">
                        {mobileItems}

                        <Divider my="md" />

                        {user ? (
                            <>
                                <Group gap="sm" mb="md">
                                    <Avatar size={40} radius="xl" color="blue">
                                        {user.username[0].toUpperCase()}
                                    </Avatar>
                                    <div>
                                        <Text fw={500}>{user.username}</Text>
                                        <Text size="xs" c="dimmed">{user.email}</Text>
                                    </div>
                                </Group>
                                <Button
                                    fullWidth
                                    variant="light"
                                    color="red"
                                    leftSection={<IconLogout size={18} />}
                                    onClick={handleLogout}
                                >
                                    Atsijungti
                                </Button>
                            </>
                        ) : (
                            <Stack gap="sm">
                                <Button
                                    fullWidth
                                    variant="filled"
                                    onClick={() => { navigate('/login'); close(); }}
                                >
                                    Prisijungti
                                </Button>
                                <Button
                                    fullWidth
                                    variant="light"
                                    onClick={() => { navigate('/register'); close(); }}
                                >
                                    Registruotis
                                </Button>
                            </Stack>
                        )}
                    </Stack>
                </Drawer>
            </div>
        </header>
    );
}
