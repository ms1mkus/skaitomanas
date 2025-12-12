import { createTheme } from '@mantine/core';

export const theme = createTheme({
    fontFamily: 'Inter, sans-serif',
    primaryColor: 'indigo',
    defaultRadius: 'md',
    colors: {

    },
    components: {
        Button: {
            defaultProps: {
                variant: 'filled',
            },
        },
    },
});
