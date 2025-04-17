"use client";

import * as React from 'react';

const visuallyHiddenStyle = {
    border: '0px',
    clip: 'rect(0px, 0px, 0px, 0px)',
    height: '1px',
    width: '1px',
    margin: '-1px',
    padding: '0px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    position: 'absolute',
};

export const VisuallyHidden = React.forwardRef<
    HTMLElement,
    React.HTMLAttributes<HTMLElement>
>((props, ref) => (
    <span
        ref={ref}
        style={visuallyHiddenStyle}
        {...props}
    />
));

VisuallyHidden.displayName = 'VisuallyHidden';
