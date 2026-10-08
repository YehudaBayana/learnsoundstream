import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMusic,
  FaHeart,
  FaFire,
  FaSearch,
  FaHistory,
  FaFolderPlus,
  FaYoutube,
} from "react-icons/fa";
import { motion } from "framer-motion";
import Button from "../Button";
import Text from "../Text";
import { Box } from "../layout";

// EmptyState: A reusable component for displaying empty states across the app
// Shows a friendly message with an icon and optional action button

export type EmptyStateType =
  "library" | "liked" | "trending" | "search" | "history" | "playlist" | "generic";

interface EmptyStateProps {
  type: EmptyStateType;
  searchQuery?: string; // For search empty state
  customMessage?: string; // Override default message
  customTitle?: string; // Override default title
  actionText?: string;
  onAction?: () => void;
  actionLink?: string;
  children?: React.ReactNode; // For smart empty states (recommendations, etc.)
  dataHook?: string;
}

// Configuration for different empty state types
const emptyStateConfig: Record<
  EmptyStateType,
  {
    icon: React.ReactNode;
    title: string;
    message: string;
    actionText?: string;
    actionLink?: string;
    colorClass: string;
  }
> = {
  library: {
    icon: <FaMusic size={48} />,
    title: "Your library is empty",
    message: "You haven't added any songs or playlists yet. Explore trending music to get started!",
    actionText: "Explore Trending",
    actionLink: "/trending",
    colorClass: "text-emerald-500 bg-emerald-500/10",
  },
  liked: {
    icon: <FaHeart size={48} />,
    title: "No liked songs yet",
    message: "Songs you like will appear here. Start discovering music on the home page!",
    actionText: "Go to Home",
    actionLink: "/",
    colorClass: "text-rose-500 bg-rose-500/10",
  },
  trending: {
    icon: <FaFire size={48} />,
    title: "No trending songs",
    message: "No songs have been played yet. Be the first to start listening!",
    actionText: "Browse Songs",
    actionLink: "/",
    colorClass: "text-orange-500 bg-orange-500/10",
  },
  search: {
    icon: <FaSearch size={48} />,
    title: "No results found",
    message: "Try adjusting your search terms or check the spelling.",
    colorClass: "text-slate-400 bg-slate-400/10",
  },
  history: {
    icon: <FaHistory size={48} />,
    title: "No listening history",
    message: "Songs you listen to will appear here. Start streaming some music!",
    actionText: "Start Listening",
    actionLink: "/",
    colorClass: "text-purple-500 bg-purple-500/10",
  },
  playlist: {
    icon: <FaFolderPlus size={48} />,
    title: "Empty playlist",
    message: "This playlist has no songs yet. Add some music to get started!",
    actionText: "Browse Music",
    actionLink: "/",
    colorClass: "text-indigo-500 bg-indigo-500/10",
  },
  generic: {
    icon: <FaYoutube size={48} />,
    title: "Nothing here",
    message: "There is no content to display at the moment.",
    colorClass: "text-slate-400 bg-slate-400/10",
  },
};

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  searchQuery,
  customMessage,
  customTitle,
  actionText,
  onAction,
  actionLink,
  children,
  dataHook,
}) => {
  const config = emptyStateConfig[type];
  const navigate = useNavigate();

  // Build the message, potentially including the search query
  let displayMessage = customMessage || config.message;
  if (type === "search" && searchQuery) {
    displayMessage = `No songs match "${searchQuery}". Try a different search term.`;
  }

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (actionLink) {
      navigate(actionLink);
    } else if (config.actionLink) {
      navigate(config.actionLink);
    }
  };

  const finalActionText = actionText || config.actionText;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      data-hook={dataHook}
      className="flex flex-col items-center justify-center py-20 px-6 text-center rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/10 dark:border-white/5"
    >
      <Box
        className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 ${config.colorClass} shadow-inner`}
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {config.icon}
        </motion.div>
      </Box>

      <Text
        variant="h2"
        weight="bold"
        className="mb-3 text-gray-900 dark:text-white"
        dataHook={dataHook ? `${dataHook}-title` : undefined}
      >
        {customTitle || config.title}
      </Text>

      <Text
        variant="body"
        color="muted"
        className="mb-10 max-w-md mx-auto leading-relaxed"
        dataHook={dataHook ? `${dataHook}-message` : undefined}
      >
        {displayMessage}
      </Text>

      <Box className="flex flex-col items-center gap-6 w-full">
        {finalActionText && (
          <Button
            size="lg"
            variant="primary"
            onClick={handleAction}
            dataHook={dataHook ? `${dataHook}-action` : undefined}
            className="px-10 py-3.5 rounded-2xl shadow-xl shadow-emerald-500/20 transform hover:scale-105 active:scale-95 transition-all duration-300"
          >
            {finalActionText}
          </Button>
        )}

        {children && <div className="w-full mt-4">{children}</div>}
      </Box>
    </motion.div>
  );
};

export default EmptyState;
