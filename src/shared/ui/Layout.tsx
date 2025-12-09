/**
 * Layout Components
 * Grid, container, flexbox helpers
 */

import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({ children, className }) => (
  <div className={`mx-auto px-4 max-w-6xl ${className || ''}`}>{children}</div>
);

interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colsClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

export const Grid: React.FC<GridProps> = ({ children, cols = 2, gap = 'md', className }) => (
  <div className={`grid ${colsClasses[cols]} ${gapClasses[gap]} ${className || ''}`}>
    {children}
  </div>
);

interface StackProps {
  children: React.ReactNode;
  direction?: 'row' | 'col';
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const dirClasses = {
  row: 'flex-row',
  col: 'flex-col',
};

export const Stack: React.FC<StackProps> = ({
  children,
  direction = 'col',
  gap = 'md',
  className,
}) => (
  <div className={`flex ${dirClasses[direction]} ${gapClasses[gap]} ${className || ''}`}>
    {children}
  </div>
);
