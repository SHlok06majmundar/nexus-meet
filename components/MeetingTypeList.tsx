/* eslint-disable camelcase */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import HomeCard from './HomeCard';
import MeetingModal from './MeetingModal';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useUser } from '@clerk/nextjs';
import Loader from './Loader';
import { Textarea } from './ui/textarea';
import ReactDatePicker from 'react-datepicker';
import { useToast } from './ui/use-toast';
import { Input } from './ui/input';
import ShareButton from './ShareButton';

const initialValues = {
  dateTime: new Date(),
  description: '',
  link: '',
};

const MeetingTypeList = () => {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<
    'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined
  >(undefined);
  const [values, setValues] = useState(initialValues);
  const [callDetail, setCallDetail] = useState<Call>();
  const client = useStreamVideoClient();
  const { user } = useUser();
  const { toast } = useToast();

  const createMeeting = async () => {
    if (!client || !user) return;
    try {
      if (!values.dateTime) {
        toast({ title: 'Please select a date and time' });
        return;
      }
      const id = crypto.randomUUID();
      const call = client.call('default', id);
      if (!call) throw new Error('Failed to create meeting');
      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || 'Instant Meeting';
      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });
      setCallDetail(call);
      if (!values.description) {
        router.push(`/meeting/${call.id}`);
      }
      toast({
        title: 'Meeting Created',
      });
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to create Meeting' });
    }
  };

  if (!client || !user) return <Loader />;

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetail?.id}`;

  return (
    <>
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <HomeCard
          img="/icons/add-meeting.svg"
          title="Instant Meeting"
          description="Start a meeting right now"
          className="transform bg-gradient-to-br from-blue-1 to-blue-2 transition-all duration-300 hover:scale-105 hover:from-blue-2 hover:to-blue-1"
          handleClick={() => setMeetingState('isInstantMeeting')}
        />
        <HomeCard
          img="/icons/schedule.svg"
          title="Schedule Meeting"
          description="Plan your meeting ahead"
          className="transform bg-gradient-to-br from-purple-1 to-purple-2 transition-all duration-300 hover:scale-105 hover:from-purple-2 hover:to-purple-1"
          handleClick={() => setMeetingState('isScheduleMeeting')}
        />
        <HomeCard
          img="/icons/join-meeting.svg"
          title="Join Meeting"
          description="Enter via invitation link"
          className="transform bg-gradient-to-br from-green-1 to-green-2 transition-all duration-300 hover:scale-105 hover:from-green-2 hover:to-green-1"
          handleClick={() => setMeetingState('isJoiningMeeting')}
        />
      </section>

      {!callDetail ? (
        <MeetingModal
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Create Meeting"
          handleClick={createMeeting}
        >
          <div className="flex flex-col gap-3">
            <label className="text-base font-semibold leading-[22.4px] text-white">
              Add a description
            </label>
            <Textarea
              className="rounded-xl border border-white/20 bg-dark-3/50 text-white backdrop-blur-md placeholder:text-white/60 focus-visible:ring-2 focus-visible:ring-blue-1 focus-visible:ring-offset-0"
              placeholder="What's this meeting about?"
              onChange={(e) =>
                setValues({ ...values, description: e.target.value })
              }
            />
          </div>
          <div className="flex w-full flex-col gap-3">
            <label className="text-base font-semibold leading-[22.4px] text-white">
              Select Date and Time
            </label>
            <ReactDatePicker
              selected={values.dateTime}
              onChange={(date) => setValues({ ...values, dateTime: date! })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full rounded-xl border border-white/20 bg-dark-3/50 p-3 text-white backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-1"
            />
          </div>
        </MeetingModal>
      ) : (
        <MeetingModal
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Meeting Created Successfully!"
          className="text-center"
          buttonText="Copy Meeting Link"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({ title: 'Link Copied' });
          }}
          image={'/icons/checked.svg'}
          buttonIcon="/icons/copy.svg"
        >
          <div className="flex flex-col gap-4">
            <p className="text-white/80">
              Your meeting has been scheduled successfully!
            </p>
            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="mb-2 text-sm text-white/70">Meeting Link:</p>
              <p className="break-all font-mono text-sm text-white">
                {meetingLink}
              </p>
            </div>
            <div className="flex justify-center">
              <ShareButton
                meetingLink={meetingLink}
                meetingTitle={values.description || 'Scheduled Meeting'}
              />
            </div>
          </div>
        </MeetingModal>
      )}

      <MeetingModal
        isOpen={meetingState === 'isJoiningMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Type the link here"
        className="text-center"
        buttonText="Join Meeting"
        handleClick={() => router.push(values.link)}
      >
        <Input
          placeholder="Meeting link"
          onChange={(e) => setValues({ ...values, link: e.target.value })}
          className="rounded-xl border border-white/20 bg-dark-3/50 text-white backdrop-blur-md placeholder:text-white/60 focus-visible:ring-2 focus-visible:ring-blue-1 focus-visible:ring-offset-0"
        />
      </MeetingModal>

      <MeetingModal
        isOpen={meetingState === 'isInstantMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Start an Instant Meeting"
        className="text-center"
        buttonText="Start Meeting"
        handleClick={createMeeting}
      />
    </>
  );
};

export default MeetingTypeList;
