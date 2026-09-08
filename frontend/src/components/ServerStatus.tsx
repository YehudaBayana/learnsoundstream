"use client";

import { useState, useEffect, useRef } from "react";
import { apiUrl } from "@/constants";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Text from "@/components/ui/Text";

interface ServicesStatus {
  database: string;
  cache: string;
}

interface HealthData {
  status: string;
  version: string;
  uptime: string;
  timestamp: string;
  services: ServicesStatus;
}

export default function ServerStatus() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">(
    "checking",
  );
  const [data, setData] = useState<HealthData | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const checkHealth = async () => {
    setIsRefreshing(true);
    const start = performance.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${apiUrl}/health`, {
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);

      const end = performance.now();

      if (res.ok) {
        const body: HealthData = await res.json();
        if (body.status === "OK") {
          setStatus("online");
          setData(body);
          setLatency(Math.round(end - start));
        } else {
          setStatus("offline");
          setData(null);
          setLatency(null);
        }
      } else {
        setStatus("offline");
        setData(null);
        setLatency(null);
      }
    } catch (err) {
      console.error("Failed to perform server health check:", err);
      setStatus("offline");
      setData(null);
      setLatency(null);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkHealth();
    // Poll the backend health every 100 seconds
    const interval = setInterval(checkHealth, 100000);
    return () => clearInterval(interval);
  }, []);

  // Handle click outside to close the panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed top-4 left-128 z-[1000] font-sans" ref={panelRef}>
      <button
        className="flex items-center gap-3 px-4 py-2 rounded-full bg-black/75 backdrop-blur-md border border-white/8 shadow-[0_4px_6px_rgba(0,0,0,0.15),0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 select-none cursor-pointer hover:bg-black/85 hover:border-white/20 hover:-translate-y-[1px] hover:shadow-[0_4px_6px_rgba(0,0,0,0.15),0_12px_40px_rgba(0,0,0,0.4)]"
        onClick={togglePanel}
        aria-label="Toggle server health status"
        aria-expanded={isOpen}
      >
        <span
          className={`w-2.5 h-2.5 rounded-full relative transition-all duration-300 ${
            status === "online"
              ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse"
              : status === "offline"
                ? "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.7)] animate-pulse"
                : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)] animate-pulse"
          }`}
        />
        <span className="text-sm font-medium text-white tracking-wide">
          {status === "online" && "Backend Connected"}
          {status === "offline" && "Backend Disconnected"}
          {status === "checking" && "Connecting..."}
        </span>
        {status === "online" && latency !== null && (
          <span className="text-xs text-slate-400 font-semibold ml-1">
            ({latency}ms)
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+12px)] left-0 w-[290px] p-5 rounded-xl bg-[#0f0f0f]/92 backdrop-blur-md border border-white/8 shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex flex-col gap-3.5 origin-top-left animate-[slideDown_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards] pointer-events-auto">
          <div className="flex justify-between items-center border-b border-white/8 pb-2">
            <Text
              variant="caption"
              weight="bold"
              color="default"
              className="uppercase tracking-wider"
            >
              System Status
            </Text>
            <IconButton
              variant="ghost"
              size="xs"
              onClick={() => setIsOpen(false)}
              aria-label="Close panel"
              className="text-gray-400 hover:text-white"
            >
              ✕
            </IconButton>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-[13px]">
              <Text variant="small" color="muted">
                Service:
              </Text>
              <Text
                variant="small"
                weight="medium"
                className="font-mono text-white"
              >
                Soundstream API
              </Text>
            </div>

            <div className="flex justify-between text-[13px]">
              <Text variant="small" color="muted">
                Status:
              </Text>
              <span
                className={`text-xs font-mono font-bold uppercase ${
                  status === "online"
                    ? "text-emerald-500"
                    : status === "offline"
                      ? "text-rose-500"
                      : "text-amber-500"
                }`}
              >
                {status === "online" && "ONLINE"}
                {status === "offline" && "OFFLINE"}
                {status === "checking" && "CHECKING..."}
              </span>
            </div>

            {status === "online" && latency !== null && (
              <div className="flex justify-between text-[13px]">
                <Text variant="small" color="muted">
                  Latency:
                </Text>
                <span
                  className={`text-xs font-mono font-bold ${
                    latency < 50
                      ? "text-emerald-500"
                      : latency < 150
                        ? "text-amber-500"
                        : "text-rose-500"
                  }`}
                >
                  {latency}ms
                </span>
              </div>
            )}

            {data && (
              <>
                <div className="flex justify-between text-[13px]">
                  <Text variant="small" color="muted">
                    Version:
                  </Text>
                  <Text
                    variant="small"
                    weight="medium"
                    className="font-mono text-white"
                  >
                    {data.version}
                  </Text>
                </div>
                <div className="flex justify-between text-[13px]">
                  <Text variant="small" color="muted">
                    Uptime:
                  </Text>
                  <Text
                    variant="small"
                    weight="medium"
                    className="font-mono text-white"
                  >
                    {data.uptime}
                  </Text>
                </div>
              </>
            )}

            <div className="flex justify-between text-[13px]">
              <Text variant="small" color="muted">
                Endpoint:
              </Text>
              <span
                className="text-[11px] font-mono text-white/80 overflow-hidden text-ellipsis whitespace-nowrap max-w-[170px]"
                title={apiUrl}
              >
                {apiUrl}
              </span>
            </div>
          </div>

          {status === "online" && data?.services && (
            <div className="border-t border-white/8 pt-3 flex flex-col gap-1.5">
              <Text
                variant="caption"
                weight="bold"
                color="muted"
                className="uppercase tracking-wider mb-0.5"
              >
                Backend Services
              </Text>
              <div className="flex justify-between text-[13px]">
                <Text variant="small" color="muted">
                  Database (Postgres):
                </Text>
                <span className="text-xs font-mono font-medium text-amber-500">
                  {data.services.database.includes("disconnected")
                    ? "Pending Config"
                    : data.services.database}
                </span>
              </div>
              <div className="flex justify-between text-[13px]">
                <Text variant="small" color="muted">
                  Cache (Redis):
                </Text>
                <span className="text-xs font-mono font-medium text-amber-500">
                  {data.services.cache.includes("disconnected")
                    ? "Pending Config"
                    : data.services.cache}
                </span>
              </div>
            </div>
          )}

          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={checkHealth}
            loading={isRefreshing}
            className="py-1.5 font-semibold text-xs rounded-lg mt-1"
          >
            {isRefreshing ? "Checking..." : "Refresh Status"}
          </Button>
        </div>
      )}
    </div>
  );
}
