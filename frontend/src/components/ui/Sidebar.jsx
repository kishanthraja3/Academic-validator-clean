import React, { useMemo, useState } from 'react';
import Icon from '../AppIcon';

const Sidebar = ({ 
  isCollapsed = false, 
  onToggle = () => {},
  className = ''
}) => {
  const [activeSection, setActiveSection] = useState('verify');

  const navigationSections = [
    {
      id: 'verify',
      label: 'Verify',
      icon: 'Shield',
      items: [
        { 
          label: 'Verifier Dashboard', 
          path: '/verifier-dashboard',
          icon: 'BarChart3',
          description: 'Overview and quick verification access'
        },
        { 
          label: 'Certificate Verification', 
          path: '/certificate-verification',
          icon: 'CheckCircle',
          description: 'Individual certificate processing'
        },
        {
          label: 'Bulk PDF Upload',
          path: '/bulk-pdf-upload',
          icon: 'FileText',
          description: 'Upload multiple PDF certificates'
        }
      ]
    },
    {
      id: 'manage',
      label: 'Manage',
      icon: 'Settings',
      items: [
        { 
          label: 'Institution Dashboard', 
          path: '/institution-dashboard',
          icon: 'Building',
          description: 'Institutional oversight and management'
        }
      ]
    },
    {
      id: 'audit',
      label: 'Audit',
      icon: 'FileText',
      items: [
        { 
          label: 'Audit Log Viewer', 
          path: '/audit-log-viewer',
          icon: 'Eye',
          description: 'System-wide monitoring and compliance'
        }
      ]
    }
  ];

  const userRole = useMemo(() => {
    try {
      return localStorage.getItem('user_role');
    } catch (e) {
      return null;
    }
  }, []);

  const filteredSections = useMemo(() => {
    if (userRole === 'verifier') {
      return navigationSections.filter(sec => sec.id === 'verify');
    }
    if (userRole === 'institution') {
      return navigationSections.filter(sec => sec.id === 'manage' || sec.id === 'audit');
    }
    return [];
  }, [userRole]);

  const isAdmin = userRole === 'institution';

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const handleSectionToggle = (sectionId) => {
    setActiveSection(activeSection === sectionId ? '' : sectionId);
  };

  return (
    <aside className={`lg:fixed top-16 left-0 z-[999] h-[calc(100vh-4rem)] bg-card border-r border-border transition-all duration-300 custom-scrollbar overflow-y-auto ${
      isCollapsed ? 'w-16' : 'w-64'
    } ${className}`}>
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!isCollapsed && (
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Navigation
            </h2>
          )}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md hover:bg-muted transition-colors duration-150"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icon 
              name={isCollapsed ? "ChevronRight" : "ChevronLeft"} 
              size={16} 
              className="text-muted-foreground"
            />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-2">
            {filteredSections?.map((section) => (
              <div key={section?.id} className="px-3">
                {/* For admin, render a flat list without dropdowns */}
                {isAdmin ? (
                  <div className="space-y-1">
                    {section?.items?.map((item) => (
                      <button
                        key={item?.path}
                        onClick={() => handleNavigation(item?.path)}
                        className="group flex items-start w-full p-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
                        title={item?.description}
                      >
                        <Icon name={item?.icon} size={16} className="flex-shrink-0 mt-0.5" />
                        {!isCollapsed && (
                          <div className="ml-3 text-left">
                            <div className="font-medium">{item?.label}</div>
                            <div className="text-xs text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              {item?.description}
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Section Header */}
                    <button
                      onClick={() => handleSectionToggle(section?.id)}
                      className={`flex items-center w-full p-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeSection === section?.id
                          ? 'bg-primary/10 text-primary' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                      title={isCollapsed ? section?.label : ''}
                    >
                      <Icon name={section?.icon} size={18} className="flex-shrink-0" />
                      {!isCollapsed && (
                        <>
                          <span className="ml-3 flex-1 text-left">{section?.label}</span>
                          <Icon 
                            name="ChevronDown" 
                            size={14} 
                            className={`transition-transform duration-200 ${
                              activeSection === section?.id ? 'rotate-180' : ''
                            }`}
                          />
                        </>
                      )}
                    </button>

                    {/* Section Items */}
                    {!isCollapsed && activeSection === section?.id && (
                      <div className="mt-2 space-y-1 animate-accordion-down">
                        {section?.items?.map((item) => (
                          <button
                            key={item?.path}
                            onClick={() => handleNavigation(item?.path)}
                            className="group flex items-start w-full p-2 pl-8 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
                            title={item?.description}
                          >
                            <Icon name={item?.icon} size={16} className="flex-shrink-0 mt-0.5" />
                            <div className="ml-3 text-left">
                              <div className="font-medium">{item?.label}</div>
                              <div className="text-xs text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {item?.description}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border">
          {!isCollapsed ? (
            <div className="text-xs text-muted-foreground">
              <p className="font-bold text-primary">TrustED</p>
              <p className="font-mono">v2.1.0 • Sept 2025</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-success rounded-full" title="System Online" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;