import React, { createContext, useContext, useState } from 'react';

/**
 * Tabs variant options.
 */
export type TabsVariant = 'default' | 'pills' | 'underline';

/**
 * Tabs size options.
 */
export type TabsSize = 'sm' | 'md' | 'lg';

// Context for sharing state between Tab components
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
  variant: TabsVariant;
  size: TabsSize;
}

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab components must be used within Tabs');
  }
  return context;
};

// ----------------------------------------------------------------------------
// Tab List
// ----------------------------------------------------------------------------

interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

const TabList: React.FC<TabListProps> = ({ children, className = '' }) => {
  const { variant } = useTabsContext();

  const variantClasses = {
    default: 'border-b border-gray-200 dark:border-slate-700',
    pills: 'bg-gray-100 dark:bg-slate-800 rounded-xl p-1',
    underline: '',
  };

  return (
    <div
      role="tablist"
      className={`flex gap-1 ${variantClasses[variant]} ${className}`}
    >
      {children}
    </div>
  );
};

// ----------------------------------------------------------------------------
// Tab
// ----------------------------------------------------------------------------

interface TabProps {
  /** Unique tab identifier */
  id: string;
  /** Tab label */
  children: React.ReactNode;
  /** Icon to display before label */
  icon?: React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
  className?: string;
}

const Tab: React.FC<TabProps> = ({
  id,
  children,
  icon,
  disabled = false,
  className = '',
}) => {
  const { activeTab, setActiveTab, variant, size } = useTabsContext();
  const isActive = activeTab === id;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'default':
        return isActive
          ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 -mb-px'
          : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300';
      case 'pills':
        return isActive
          ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm rounded-lg'
          : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white';
      case 'underline':
        return isActive
          ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
          : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 border-b-2 border-transparent';
    }
  };

  return (
    <button
      role="tab"
      type="button"
      id={`tab-${id}`}
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(id)}
      className={`
        inline-flex items-center gap-2
        font-medium
        transition-all
        ${sizeClasses[size]}
        ${getVariantClasses()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
        dark:focus-visible:ring-offset-slate-900
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

// ----------------------------------------------------------------------------
// Tab Panel
// ----------------------------------------------------------------------------

interface TabPanelProps {
  /** Tab ID this panel corresponds to */
  id: string;
  /** Panel content */
  children: React.ReactNode;
  className?: string;
}

const TabPanel: React.FC<TabPanelProps> = ({ id, children, className = '' }) => {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === id;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      className={`focus:outline-none ${className}`}
    >
      {children}
    </div>
  );
};

// ----------------------------------------------------------------------------
// Tabs
// ----------------------------------------------------------------------------

interface TabsProps {
  /** Tab content (TabList and TabPanels) */
  children: React.ReactNode;
  /** Default active tab ID */
  defaultTab?: string;
  /** Controlled active tab ID */
  activeTab?: string;
  /** Called when active tab changes */
  onTabChange?: (id: string) => void;
  /** Tabs style variant */
  variant?: TabsVariant;
  /** Tabs size */
  size?: TabsSize;
  className?: string;
}

/**
 * Tabs - Tab navigation component.
 *
 * A compound component for creating tabbed interfaces.
 *
 * Features:
 * - Multiple variants (default, pills, underline)
 * - Multiple sizes
 * - Controlled and uncontrolled modes
 * - Keyboard navigation
 * - Icon support
 * - Disabled state
 * - Dark mode support
 *
 * Usage:
 *   <Tabs defaultTab="tab1">
 *     <Tabs.List>
 *       <Tabs.Tab id="tab1">Tab 1</Tabs.Tab>
 *       <Tabs.Tab id="tab2">Tab 2</Tabs.Tab>
 *     </Tabs.List>
 *     <Tabs.Panel id="tab1">Content 1</Tabs.Panel>
 *     <Tabs.Panel id="tab2">Content 2</Tabs.Panel>
 *   </Tabs>
 *
 *   // Pills variant
 *   <Tabs variant="pills" defaultTab="tab1">
 *     ...
 *   </Tabs>
 *
 *   // Controlled
 *   <Tabs activeTab={activeTab} onTabChange={setActiveTab}>
 *     ...
 *   </Tabs>
 */
const Tabs: React.FC<TabsProps> & {
  List: typeof TabList;
  Tab: typeof Tab;
  Panel: typeof TabPanel;
} = ({
  children,
  defaultTab = '',
  activeTab: controlledActiveTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab);

  const isControlled = controlledActiveTab !== undefined;
  const activeTab = isControlled ? controlledActiveTab : internalActiveTab;

  const setActiveTab = (id: string) => {
    if (!isControlled) {
      setInternalActiveTab(id);
    }
    onTabChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, variant, size }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

// Attach subcomponents
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

export default Tabs;
