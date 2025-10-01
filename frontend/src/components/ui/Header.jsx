import React, { useMemo, useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';

import Input from './Input';
import ThemeToggle from './ThemeToggle';


const Header = ({ 
  isCollapsed = false, 
  onToggleSidebar = () => {},
  user = { name: 'John Doe', role: 'Verifier', institution: 'State University' },
  notifications = [],
  onLogout = () => {},
  onSearch = () => {},
  className = '',
  hideRoleNav = false
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  const navigationItems = [
    { 
      label: 'Verify', 
      path: '/verifier-dashboard',
      icon: 'Shield',
      tooltip: 'Certificate verification workflows'
    },
    { 
      label: 'Manage', 
      path: '/institution-dashboard',
      icon: 'Settings',
      tooltip: 'Administrative management functions'
    },
    { 
      label: 'Audit', 
      path: '/audit-log-viewer',
      icon: 'FileText',
      tooltip: 'Compliance and oversight monitoring'
    }
  ];

  const unreadCount = notifications?.filter(n => !n?.read)?.length;

  const userRole = useMemo(() => {
    try {
      return localStorage.getItem('user_role');
    } catch (e) {
      return null;
    }
  }, []);

  // Build role-specific sub-navigation (no More menu)
  const roleNavItems = useMemo(() => {
    if (userRole === 'verifier') {
      return [
        { label: 'Verifier Dashboard', path: '/verifier-dashboard', icon: 'BarChart3' },
        { label: 'Certificate Verification', path: '/certificate-verification', icon: 'CheckCircle' },
        { label: 'Bulk Upload', path: '/bulk-upload-manager', icon: 'Upload' }
      ];
    }
    if (userRole === 'institution') {
      // Admin should not show nav items per request
      return [];
    }
    return [];
  }, [userRole]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef?.current && !profileRef?.current?.contains(event?.target)) {
        setIsProfileOpen(false);
      }
      if (notificationRef?.current && !notificationRef?.current?.contains(event?.target)) {
        setIsNotificationOpen(false);
      }
      if (searchRef?.current && !searchRef?.current?.contains(event?.target)) {
        setIsSearchExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery?.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleNavigation = (path) => {
    window.location.href = path;
    setIsMobileMenuOpen(false);
  };

  const handleNotificationClick = (notification) => {
    if (notification?.action) {
      notification?.action();
    }
    setIsNotificationOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-[1000] bg-card border-b border-border ${className}`}>
      <div className="w-full max-w-none px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Icon name="Shield" size={24} color="white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-foreground bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  TrustED
                </h1>
              </div>
            </div>

            {/* Desktop Navigation (role-based sub-items) */}
            {!hideRoleNav && (
              <nav className="hidden lg:flex items-center space-x-1">
                {roleNavItems?.map((item) => (
                  <button
                    key={item?.path}
                    onClick={() => handleNavigation(item?.path)}
                    className="group relative flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                  >
                    <Icon name={item?.icon} size={16} />
                    <span>{item?.label}</span>
                  </button>
                ))}
              </nav>
            )}
          </div>

          {/* Right Section - Search, Notifications, Profile */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            {/* Search Bar */}
            <div ref={searchRef} className="relative hidden md:block">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className={`flex items-center transition-all duration-300 ${
                  isSearchExpanded ? 'w-80' : 'w-64'
                }`}>
                  <Input
                    type="search"
                    placeholder="Search certificates, institutions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e?.target?.value)}
                    onFocus={() => setIsSearchExpanded(true)}
                    className="pr-10"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150"
                  >
                    <Icon name="Search" size={16} />
                  </button>
                </div>
              </form>
            </div>

            {/* Mobile Search Icon */}
            <button className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors duration-150">
              <Icon name="Search" size={20} />
            </button>

            {/* Notifications */}
            <div ref={notificationRef} className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                <Icon name="Bell" size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-error rounded-full animate-spring">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute top-full right-0 mt-1 w-80 bg-popover border border-border rounded-md shadow-modal z-[1010]">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-medium text-popover-foreground">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications?.length > 0 ? (
                      notifications?.slice(0, 5)?.map((notification, index) => (
                        <button
                          key={index}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full p-4 text-left hover:bg-muted transition-colors duration-150 border-b border-border last:border-b-0 ${
                            !notification?.read ? 'bg-accent/5' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                              notification?.type === 'success' ? 'bg-success' :
                              notification?.type === 'warning' ? 'bg-warning' :
                              notification?.type === 'error' ? 'bg-error' : 'bg-primary'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-popover-foreground truncate">
                                {notification?.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification?.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification?.time}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        <Icon name="Bell" size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    )}
                  </div>
                  {notifications?.length > 5 && (
                    <div className="p-3 border-t border-border">
                      <button className="w-full text-sm text-primary hover:text-primary/80 transition-colors duration-150">
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Profile */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted transition-colors duration-150"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                  {user?.name?.split(' ')?.map(n => n?.[0])?.join('')}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.role}</p>
                </div>
                <Icon name="ChevronDown" size={16} className="text-muted-foreground" />
              </button>

              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-1 w-64 bg-popover border border-border rounded-md shadow-modal z-[1010]">
                  <div className="p-4 border-b border-border">
                    <p className="font-medium text-popover-foreground">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.role}</p>
                    <p className="text-xs text-muted-foreground font-mono">{user?.institution}</p>
                  </div>
                  <div className="py-1">
                    <button className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-150">
                      <Icon name="User" size={16} />
                      <span>Profile Settings</span>
                    </button>
                    <button className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-150">
                      <Icon name="Settings" size={16} />
                      <span>Preferences</span>
                    </button>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={onLogout}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-error hover:bg-muted transition-colors duration-150"
                    >
                      <Icon name="LogOut" size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu (role-based) */}
        {isMobileMenuOpen && !hideRoleNav && (
          <div className="lg:hidden border-t border-border bg-card">
            <div className="py-2 space-y-1">
              {roleNavItems?.map((item) => (
                <button
                  key={item?.path}
                  onClick={() => handleNavigation(item?.path)}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors duration-150"
                >
                  <Icon name={item?.icon} size={16} />
                  <span>{item?.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;