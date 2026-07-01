'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import type { UserSession } from '@/types/booking';
import { getUserInitials } from '@/lib/spaceMeta';
import type { AdminNavItem } from '@/types/admin';

interface AdminDashboardShellProps {
  user: UserSession;
  activeNav: AdminNavItem;
  pendingCount: number;
  onNavChange: (nav: AdminNavItem) => void;
  onLogout: () => void;
  children: ReactNode;
}

const navItems: { id: AdminNavItem; label: string; icon: string }[] = [
  { id: 'spaces', label: 'Manage Spaces', icon: '🏢' },
  { id: 'requests', label: 'Review Requests', icon: '📋' },
  { id: 'availability', label: 'Availability Table', icon: '📅' },
  { id: 'profile', label: 'My Profile', icon: '👤' },
];

export default function AdminDashboardShell({
  user,
  activeNav,
  pendingCount,
  onNavChange,
  onLogout,
  children,
}: AdminDashboardShellProps) {
  const initials = getUserInitials(user.username);

  return (
    <div className="sccl-shell flex-col">
      <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="sccl-logo">S</div>
            <div>
              <p className="text-base font-bold text-slate-900">SCCL</p>
              <p className="hidden text-xs text-slate-500 sm:block">
                Smart Campus Space &amp; Lab Booking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center rounded-full bg-slate-100 p-1 text-xs font-medium">
              <Link
                href="/login"
                className="px-3 py-1.5 text-slate-500 transition-colors hover:text-slate-700"
              >
                Student
              </Link>
              <span className="rounded-full bg-brand-600 px-3 py-1.5 text-white shadow-sm">
                Admin
              </span>
            </div>

            <button
              type="button"
              onClick={() => onNavChange('requests')}
              className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-brand-50 hover:text-brand-600"
              aria-label="Notifications"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {pendingCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex w-full flex-1">
        <aside className="hidden w-64 shrink-0 self-stretch border-r border-slate-200/80 bg-white lg:flex lg:w-72 xl:w-80">
          <div className="sticky top-16 flex h-[calc(100vh-4rem)] w-full flex-col overflow-y-auto px-5 py-6 xl:px-6">
            <div className="mb-8 flex items-center gap-3">
              <div className="sccl-avatar h-12 w-12">{initials || 'AD'}</div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{user.username}</p>
                <p className="text-xs text-slate-500">Admin Portal</p>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeNav === item.id;
                const showBadge = item.id === 'requests' && pendingCount > 0;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavChange(item.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive ? 'sccl-nav-active' : 'sccl-nav-inactive'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-base">{item.icon}</span>
                      {item.label}
                    </span>
                    {showBadge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700'
                        }`}
                      >
                        {pendingCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="sccl-info-panel mt-8">
              <p className="text-sm font-semibold text-slate-900">Admin Tools</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Manage campus spaces, review student booking requests, and monitor availability.
              </p>
            </div>

            <button type="button" onClick={onLogout} className="sccl-btn-secondary mt-auto w-full">
              Log out
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
