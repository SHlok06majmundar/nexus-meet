import CallList from '@/components/CallList';

const RecordingsPage = () => {
  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-gradient-to-br from-green-1 to-green-2 p-3">
          <span className="text-2xl">🎥</span>
        </div>
        <h1 className="bg-gradient-to-r from-green-3 to-green-1 bg-clip-text text-4xl font-bold text-transparent">
          Recordings
        </h1>
      </div>

      <CallList type="recordings" />
    </section>
  );
};

export default RecordingsPage;
