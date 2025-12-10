/**
 * Layout Components (shadcn/ui style)
 * Grid, container, flexbox helpers
 */

import * as React from 'react';
import { cn } from '@/shared/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mx-auto max-w-6xl px-4', className)}
      {...props}
    >
      {children}
    </div>
  )
);

Container.displayName = 'Container';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

const colsClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-2 sm:grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4',
};

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ children, cols = 2, gap = 'md', className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('grid', colsClasses[cols], gapClasses[gap], className)}
      {...props}
    >
      {children}
    </div>
  )
);

Grid.displayName = 'Grid';

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: 'row' | 'col';
  gap?: 'sm' | 'md' | 'lg';
}

const dirClasses = {
  row: 'flex-row',
  col: 'flex-col',
};

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ children, direction = 'col', gap = 'md', className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex', dirClasses[direction], gapClasses[gap], className)}
      {...props}
    >
      {children}
    </div>
  )
);

Stack.displayName = 'Stack';
