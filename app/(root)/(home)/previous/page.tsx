import CallList from '@/components/CallList';

const PreviousPage = () => {
  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <div className="flex items-center justify-between">
        <h1 className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-3xl font-bold text-transparent">
          Previous Meetings
        </h1>
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-gray-400"></div>
          <span className="text-sm text-white/60">Meeting History</span>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <CallList type="ended" />
      </div>
    </section>
  );
};

export default PreviousPage;
