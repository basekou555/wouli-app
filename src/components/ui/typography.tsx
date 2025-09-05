import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

// Heading component variants
const headingVariants = cva(
  'font-display font-bold leading-tight tracking-tight',
  {
    variants: {
      level: {
        1: 'text-4xl md:text-5xl lg:text-6xl',
        2: 'text-3xl md:text-4xl lg:text-5xl',
        3: 'text-2xl md:text-3xl',
        4: 'text-xl md:text-2xl',
        5: 'text-lg md:text-xl',
        6: 'text-base md:text-lg',
      },
      variant: {
        default: 'text-foreground',
        gradient: 'text-gradient-primary',
        muted: 'text-muted-foreground',
      },
    },
    defaultVariants: {
      level: 1,
      variant: 'default',
    },
  }
);

// Text component variants
const textVariants = cva(
  'font-sans',
  {
    variants: {
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
      },
      variant: {
        default: 'text-foreground',
        muted: 'text-muted-foreground',
        accent: 'text-accent',
        gradient: 'text-gradient-primary',
      },
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      },
    },
    defaultVariants: {
      size: 'base',
      variant: 'default',
      weight: 'normal',
    },
  }
);

// Heading components
interface HeadingProps 
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function Heading({ 
  className, 
  level = 1, 
  variant, 
  as, 
  children, 
  ...props 
}: HeadingProps) {
  if (as) {
    return React.createElement(
      as,
      {
        className: cn(headingVariants({ level, variant }), className),
        ...props
      },
      children
    );
  }
  
  const Component = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  
  return React.createElement(
    Component,
    {
      className: cn(headingVariants({ level, variant }), className),
      ...props
    },
    children
  );
}

// Specific heading components
export function H1({ className, ...props }: Omit<HeadingProps, 'level'>) {
  return <Heading level={1} className={className} {...props} />;
}

export function H2({ className, ...props }: Omit<HeadingProps, 'level'>) {
  return <Heading level={2} className={className} {...props} />;
}

export function H3({ className, ...props }: Omit<HeadingProps, 'level'>) {
  return <Heading level={3} className={className} {...props} />;
}

export function H4({ className, ...props }: Omit<HeadingProps, 'level'>) {
  return <Heading level={4} className={className} {...props} />;
}

// Text component
interface TextProps 
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  as?: keyof JSX.IntrinsicElements;
}

export function Text({ 
  className, 
  size, 
  variant, 
  weight, 
  as: Component = 'p', 
  children, 
  ...props 
}: TextProps) {
  return (
    React.createElement(
      Component,
      {
        className: cn(textVariants({ size, variant, weight }), className),
        ...props
      },
      children
    )
  );
}

// Section Header component
interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  gradient?: boolean;
}

export function SectionHeader({ 
  title, 
  description, 
  gradient = false,
  className, 
  ...props 
}: SectionHeaderProps) {
  return (
    <div className={cn('space-y-2 mb-6', className)} {...props}>
      <H2 variant={gradient ? 'gradient' : 'default'}>
        {title}
      </H2>
      {description && (
        <Text variant="muted" size="lg">
          {description}
        </Text>
      )}
    </div>
  );
}

// Page Header component
interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  gradient?: boolean;
}

export function PageHeader({ 
  title, 
  subtitle, 
  gradient = true,
  className, 
  ...props 
}: PageHeaderProps) {
  return (
    <div className={cn('text-center space-y-4 mb-8', className)} {...props}>
      <H1 variant={gradient ? 'gradient' : 'default'}>
        {title}
      </H1>
      {subtitle && (
        <Text variant="muted" size="xl" className="max-w-2xl mx-auto">
          {subtitle}
        </Text>
      )}
    </div>
  );
}