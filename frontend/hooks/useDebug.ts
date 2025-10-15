import * as React from "react";
import { LogLevel, setLogLevel } from "livekit-client";
import { useRoomContext } from "@livekit/components-react";

export const useDebugMode = ({ logLevel }: { logLevel?: LogLevel } = {}) => {
  const room = useRoomContext();

  React.useEffect(() => {
    setLogLevel(logLevel ?? "debug");

    // @ts-expect-error - Adding custom property to window for debugging purposes
    window.__lk_room = room;

    return () => {
      // @ts-expect-error - Removing custom property from window for debugging purposes
      window.__lk_room = undefined;
    };
  }, [room, logLevel]);
};
