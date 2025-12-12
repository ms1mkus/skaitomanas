import { Container, Group, Text } from '@mantine/core';
import { IconBook } from '@tabler/icons-react';
import classes from './Footer.module.css';

export function Footer() {
    return (
        <div className={classes.footer}>
            <Container className={classes.inner}>
                <Group>
                    <IconBook size={28} />
                    <Text fw={700}>Skaitomanas</Text>
                </Group>
            </Container>
        </div>
    );
}
