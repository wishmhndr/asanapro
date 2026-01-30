import * as React from 'react';

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'ion-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                name?: string;
                src?: string;
                md?: string;
                ios?: string;
                size?: string;
                class?: string;
                className?: string;
                color?: string;
            };
        }
    }
}
