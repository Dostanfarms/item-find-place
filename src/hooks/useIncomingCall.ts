import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNativeNotifications } from "./useNativeNotifications";

interface UseIncomingCallProps {
  chatId: string | null;
  myId: string;
  myType: 'user' | 'delivery_partner';
  onIncomingCall: (callId: string, offer: RTCSessionDescriptionInit, callerName: string, callerType: 'user' | 'delivery_partner') => void;
}

export const useIncomingCall = ({
  chatId,
  myId,
  myType,
  onIncomingCall,
}: UseIncomingCallProps) => {
  const processedCallsRef = useRef<Set<string>>(new Set());
  const activeNotificationIdRef = useRef<number | null>(null);
  const { showIncomingCallNotification, dismissIncomingCallNotification, isNative } = useNativeNotifications();

  // Dismiss any active incoming call notification
  const dismissActiveNotification = useCallback(async () => {
    if (activeNotificationIdRef.current !== null) {
      await dismissIncomingCallNotification(activeNotificationIdRef.current);
      activeNotificationIdRef.current = null;
    }
  }, [dismissIncomingCallNotification]);

  useEffect(() => {
    if (!chatId || !myId) return;

    // Listen to database changes for voice_calls
    const dbChannel = supabase
      .channel(`voice-calls-db-${chatId}-${myId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'voice_calls',
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          const call = payload.new as any;
          
          // Only handle calls where we are the receiver and haven't processed this call
          if (call.receiver_id === myId && call.status === 'ringing' && !processedCallsRef.current.has(call.id)) {
            console.log('New incoming call detected from database:', call.id);
            processedCallsRef.current.add(call.id);
            
            // Subscribe to this call's signaling channel to get the offer
            const callChannel = supabase.channel(`call-incoming-${call.id}`);
            
            callChannel
              .on('broadcast', { event: 'offer' }, async ({ payload: offerPayload }) => {
                console.log('Received offer for incoming call');
                if (offerPayload.from !== myId) {
                  const callerName = offerPayload.callerName || 'Unknown';
                  
                  // Show native notification for Android background/locked screen
                  if (isNative) {
                    const notificationId = await showIncomingCallNotification(callerName, call.id);
                    activeNotificationIdRef.current = notificationId;
                  }

                  onIncomingCall(
                    call.id,
                    offerPayload.offer,
                    callerName,
                    call.caller_type
                  );
                }
                // Unsubscribe after receiving the offer
                supabase.removeChannel(callChannel);
              })
              .subscribe();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'voice_calls',
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          const call = payload.new as any;
          
          // Dismiss notification when call is answered, declined, or ended
          if (call.receiver_id === myId && ['connected', 'declined', 'ended', 'missed'].includes(call.status)) {
            await dismissActiveNotification();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(dbChannel);
      dismissActiveNotification();
    };
  }, [chatId, myId, myType, onIncomingCall, isNative, showIncomingCallNotification, dismissActiveNotification]);

  return {
    dismissActiveNotification,
  };
};
