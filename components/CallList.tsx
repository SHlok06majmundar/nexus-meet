'use client';

import { Call, CallRecording } from '@stream-io/video-react-sdk';

import Loader from './Loader';
import { useGetCalls } from '@/hooks/useGetCalls';
import MeetingCard from './MeetingCard';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const CallList = ({ type }: { type: 'upcoming' | 'recordings' | 'ended' }) => {
  const router = useRouter();
  const { endedCalls, upcomingCalls, callRecordings, isLoading } = useGetCalls();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);

  const getCalls = () => {
    switch (type) {
      case 'recordings':
        return recordings;
      case 'upcoming':
        return upcomingCalls;
      case 'ended':
        return endedCalls;
      default:
        return [];
    }
  };

  const getNoCallsMessage = () => {
    switch (type) {
      case 'recordings':
        return 'No recordings found';
      case 'upcoming':
        return 'No upcoming meetings';
      case 'ended':
        return 'No previous meetings';
      default:
        return 'No calls found';
    }
  };

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const callData = await Promise.all(
          callRecordings?.map((meeting) => meeting.queryRecordings()) ?? [],
        );

        const recordings = callData
          .filter((call) => call.recordings.length > 0)
          .flatMap((call) => call.recordings);

        setRecordings(recordings);
      } catch (error) {
        console.error('Error fetching recordings:', error);
      }
    };

    if (type === 'recordings') {
      fetchRecordings();
    }
  }, [type, callRecordings]);

  if (isLoading) return <Loader />;

  const calls = getCalls();
  const noCallsMessage = getNoCallsMessage();

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {calls && calls.length > 0 ? (
        calls.map((meeting: Call | CallRecording) => (
          <MeetingCard
            key={(meeting as Call).id}
            icon={
              type === 'ended'
                ? '/icons/previous.svg'
                : type === 'upcoming'
                ? '/icons/upcoming.svg'
                : '/icons/recordings.svg'
            }
            title={
              (meeting as Call).state?.custom?.description ||
              (meeting as CallRecording).filename ||
              'Personal Meeting'
            }
            date={
              (meeting as Call).state?.startsAt?.toLocaleString() ||
              (meeting as CallRecording).start_time ||
              ''
            }
            isPreviousMeeting={type === 'ended'}
            link={
              type === 'recordings'
                ? (meeting as CallRecording).url
                : `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${(meeting as Call).id}`
            }
            buttonIcon1={type === 'recordings' ? '/icons/play.svg' : undefined}
            buttonText={type === 'recordings' ? 'Play' : 'Start'}
            handleClick={
              type === 'recordings'
                ? () => router.push(`${(meeting as CallRecording).url}`)
                : () => router.push(`/meeting/${(meeting as Call).id}`)
            }
            onDelete={
              type === 'recordings'
                ? async () => {
                    try {
                      // Implement recording deletion
                      console.log('Deleting recording:', (meeting as CallRecording).filename);
                      // Remove from local state
                      setRecordings(prev => prev.filter(rec => rec.filename !== (meeting as CallRecording).filename));
                    } catch (error) {
                      console.error('Error deleting recording:', error);
                    }
                  }
                : undefined
            }
          />
        ))
      ) : (
        <div className="flex items-center justify-center h-60">
          <h1 className="text-2xl font-bold text-white">{noCallsMessage}</h1>
        </div>
      )}
    </div>
  );
};

export default CallList;
