import { AppShell } from '@mantine/core';
import { Header } from '../Header/Header';
import { Footer } from '../Footer/Footer';
import { Outlet } from 'react-router-dom';

export function Layout() {
    return (
        <AppShell header={{ height: 60 }} padding="md">
            <AppShell.Header>
                <Header />
            </AppShell.Header>

            <AppShell.Main>
                <div style={{ minHeight: 'calc(100vh - 60px - 160px)' }}>
                    <Outlet />
                </div>
                <Footer />
            </AppShell.Main>
        </AppShell>
    );
}
