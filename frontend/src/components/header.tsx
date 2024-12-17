'use client'

import React from 'react'
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator } from './ui/menubar'
import { MenubarTrigger } from '@radix-ui/react-menubar'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from './ui/navigation-menu'
import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from './ui/button'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const navItems = [
    { title: 'Swap', href: '/' },
    { title: 'Pool', href: '/pool' },
    { title: 'Create a New Token', href: '/create-token' },
]

export default function Header() {
    const currentPath = usePathname();
    return (
        <header className='flex w-full shrink-0 items-center px-6 py-2'>
            <NavigationMenu className='space-x-8'>
                <NavigationMenuLink href='/'>
                    <Image src='/logo.png' alt='Logo' width={52} height={52} />
                </NavigationMenuLink>
                <NavigationMenuList>
                    {navItems.map((item) => (
                        <Button key={item.href} variant={'link'} className={(currentPath === item.href ? 'underline ' : '') + 'font-bold text-foreground'} asChild>
                            <Link href={item.href} className='font-bold'>{item.title}</Link>
                        </Button>
                    ))}
                </NavigationMenuList>
            </NavigationMenu>
            <div className='ml-auto'>
                <ConnectButton />
            </div>
        </header>
    )
}
