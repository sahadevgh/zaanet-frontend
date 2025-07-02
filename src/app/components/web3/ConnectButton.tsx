'use client'

import { forwardRef, ReactNode } from 'react'
import { motion, MotionProps } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import Link, { LinkProps } from 'next/link'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-500',
        ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
        outline: 'bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-blue-100 border-2 border-blue-600 hover:border-blue-100',
        destructive: 'bg-red-500 text-white hover:bg-red-600 dark:hover:bg-red-400',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

type ButtonBaseProps = VariantProps<typeof buttonVariants> & {
  children: ReactNode
  className?: string
}

type ButtonAsButton = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> &
  MotionProps

type ButtonAsLink = ButtonBaseProps &
  Omit<LinkProps, keyof ButtonBaseProps> & {
    asLink: true
  }

type ButtonProps = ButtonAsButton | ButtonAsLink

const ConnectButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (props, ref) => {
    const { className, variant, size, children, ...rest } = props

    if ('asLink' in props && props.asLink) {
      const linkProps = rest as Omit<ButtonAsLink, keyof ButtonBaseProps>
      return (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex"
        >
          <Link
            {...linkProps}
            ref={ref as React.Ref<HTMLAnchorElement>}
            className={cn(buttonVariants({ variant, size }), className)}
          >
            {children}
          </Link>
        </motion.div>
      )
    }

    const buttonProps = rest as Omit<ButtonAsButton, keyof ButtonBaseProps>

    return (
      <motion.button
        {...buttonProps}
        ref={ref as React.Ref<HTMLButtonElement>}
        className={cn(buttonVariants({ variant, size }), className)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.button>
    )
  }
)

ConnectButton.displayName = 'Button'

export { ConnectButton, buttonVariants }