'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import { motion } from 'motion/react';
import { RoomAudioRenderer, RoomContext, StartAudio } from '@livekit/components-react';
import { APP_CONFIG_DEFAULTS } from '@/app-config';
import { ErrorMessage } from '@/components/embed-popup/error-message';
import { PopupView } from '@/components/embed-popup/popup-view';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import useConnectionDetails from '@/hooks/use-connection-details';
import { type EmbedErrorDetails } from '@/lib/types';

const PopupViewMotion = motion.create(PopupView);

interface VoiceInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
}

export function VoiceInterface({ isOpen, onClose, agentName }: VoiceInterfaceProps) {
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState('');

  // Simulate connection delay for non-avatar agents
  useState(() => {
    if (isOpen && agentName !== 'Avatar Agent') {
      setConnecting(true);
      setError('');
      setTimeout(() => {
        setConnecting(false);
      }, 1500);
    }
  });

  const isAvatarAgent = agentName === 'Avatar Agent';

  // Avatar Agent popup implementation
  const isAnimating = useRef(false);
  const room = useMemo(() => new Room(), []);
  const [embedError, setEmbedError] = useState<EmbedErrorDetails | null>(null);
  const { refreshConnectionDetails, existingOrRefreshConnectionDetails } =
    useConnectionDetails(APP_CONFIG_DEFAULTS);

  const handlePanelAnimationStart = () => {
    isAnimating.current = true;
  };

  const handlePanelAnimationComplete = () => {
    isAnimating.current = false;
    if (!isOpen && room.state !== 'disconnected') {
      room.disconnect();
    }
  };

  useEffect(() => {
    if (!isAvatarAgent) return;

    const onDisconnected = () => {
      refreshConnectionDetails();
      onClose();
    };
    const onMediaDevicesError = (error: Error) => {
      setEmbedError({
        title: 'Encountered an error with your media devices',
        description: `${error.name}: ${error.message}`,
      });
    };
    room.on(RoomEvent.MediaDevicesError, onMediaDevicesError);
    room.on(RoomEvent.Disconnected, onDisconnected);
    return () => {
      room.off(RoomEvent.Disconnected, onDisconnected);
      room.off(RoomEvent.MediaDevicesError, onMediaDevicesError);
    };
  }, [room, refreshConnectionDetails, isAvatarAgent, onClose]);

  useEffect(() => {
    if (!isAvatarAgent || !isOpen) {
      return;
    }
    if (room.state !== 'disconnected') {
      return;
    }

    const connect = async () => {
      try {
        const details = await existingOrRefreshConnectionDetails();
        if (!details) {
          setEmbedError({
            title: 'Error fetching connection details',
            description: 'Please try again later',
          });
          return;
        }

        await Promise.all([
          room.localParticipant.setMicrophoneEnabled(true, undefined, {
            preConnectBuffer: APP_CONFIG_DEFAULTS.isPreConnectBufferEnabled,
          }),
          room.connect(details.serverUrl, details.participantToken),
        ]);
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error connecting to agent:', error);
          setEmbedError({
            title: 'There was an error connecting to the agent',
            description: `${error.name}: ${error.message}`,
          });
        }
      }
    };

    connect();
  }, [room, isOpen, isAvatarAgent, existingOrRefreshConnectionDetails]);

  return (
    <>
      {isAvatarAgent ? (
        // Avatar Agent - Popup style like home page
        <RoomContext.Provider value={room}>
          <RoomAudioRenderer />
          <StartAudio label="Start Audio" />

          {/* Backdrop */}
          {isOpen && (
            <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} aria-hidden="true" />
          )}

          <motion.div
            inert={!isOpen}
            initial={{
              opacity: 0,
              translateY: 8,
            }}
            animate={{
              opacity: isOpen ? 1 : 0,
              translateY: isOpen ? 0 : 8,
            }}
            transition={{
              type: 'spring',
              bounce: 0,
              duration: isOpen ? 1 : 0.2,
            }}
            onAnimationStart={handlePanelAnimationStart}
            onAnimationComplete={handlePanelAnimationComplete}
            className="fixed right-4 bottom-4 left-4 z-50 md:left-auto"
          >
            <div className="bg-bg1 dark:bg-bg2 border-separator1 dark:border-separator2 ml-auto h-[480px] w-full rounded-[28px] border border-solid drop-shadow-md md:w-[360px]">
              <div className="relative h-full w-full">
                <ErrorMessage error={embedError} />
                {!embedError && (
                  <PopupViewMotion
                    appConfig={APP_CONFIG_DEFAULTS}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: embedError === null ? 1 : 0 }}
                    transition={{
                      type: 'linear',
                      duration: 0.2,
                    }}
                    disabled={!isOpen}
                    sessionStarted={isOpen}
                    onEmbedError={setEmbedError}
                    className="absolute inset-0"
                  />
                )}
              </div>
            </div>
          </motion.div>
        </RoomContext.Provider>
      ) : (
        // Other agents - Dialog style
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{agentName}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {connecting ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-12">
                  <LoadingSpinner size="lg" />
                  <p className="text-fg2">Connecting to agent...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-12">
                  <p className="text-red-500">{error}</p>
                  <Button onClick={onClose}>Close</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-bg2 flex min-h-[300px] flex-col items-center justify-center rounded-lg p-6">
                    <div className="space-y-4 text-center">
                      <div className="mx-auto h-16 w-16 animate-pulse rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                      <p className="text-fg1">Agent is ready</p>
                      <p className="text-fg3 text-sm">
                        This is a demo interface. In production, this would connect to the LiveKit
                        voice agent.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center gap-2">
                    <Button variant="outline" onClick={onClose}>
                      End Call
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
