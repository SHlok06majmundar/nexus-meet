import CallList from '@/components/CallList';

const UpcomingPage = () => {
  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-gradient-to-br from-blue-1 to-purple-1 p-3">
          <span className="text-2xl">📅</span>
        </div>
        <h1 className="bg-gradient-to-r from-blue-3 to-purple-3 bg-clip-text text-4xl font-bold text-transparent">
          Upcoming Meetings
        </h1>
      </div>

      <CallList type="upcoming" />
    </section>
  );
};

export default UpcomingPage;
