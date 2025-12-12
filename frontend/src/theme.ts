import { createTheme } from '@mantine/core';

export const theme = createTheme({
    fontFamily: 'Inter, sans-serif',
    primaryColor: 'indigo',
    defaultRadius: 'md',
    colors: {
        // Custom colors can be added here if needed
    },
    components: {
        Button: {
            defaultProps: {
                variant: 'filled',
            },
        },
    },
});
