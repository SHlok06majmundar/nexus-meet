import MeetingTypeList from '@/components/MeetingTypeList';

const Home = () => {
  const now = new Date();

  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const date = (new Intl.DateTimeFormat('en-US', { dateStyle: 'full' })).format(now);

  return (
    <section className="flex size-full flex-col gap-8 text-white">
      <div className="h-[320px] w-full rounded-3xl bg-gradient-to-br from-blue-600/80 via-purple-600/80 to-pink-600/80 backdrop-blur-lg border border-white/20 shadow-2xl">
        <div className="flex h-full flex-col justify-between max-md:px-6 max-md:py-8 lg:p-12">
          <div className="glassmorphism max-w-[300px] rounded-2xl py-3 px-6 text-center">
            <h2 className="text-base font-semibold text-white">
              ✨ Welcome to Nexus Meet
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-5xl font-extrabold lg:text-8xl bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent drop-shadow-2xl">
              {time}
            </h1>
            <p className="text-xl font-medium text-white/90 lg:text-3xl drop-shadow-lg">
              {date}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Quick Actions
        </h2>
        <MeetingTypeList />
      </div>
    </section>
  );
};

export default Home;
