import MeetingTypeList from '@/components/MeetingTypeList';
import QuickNavCard from '@/components/QuickNavCard';

const Dashboard = () => {
  const now = new Date();

  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const date = (new Intl.DateTimeFormat('en-US', { dateStyle: 'full' })).format(now);

  return (
    <section className="flex size-full flex-col gap-10 text-white">
      {/* Welcome Header */}
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
        <div>
          <h1 className="mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent lg:text-5xl">
            Welcome to Nexus Meet
          </h1>
          <p className="text-lg text-white/80">
            Professional video conferencing platform for seamless collaboration
          </p>
        </div>
        <div className="text-right">
          <div className="mb-1 text-3xl font-bold text-white lg:text-4xl">{time}</div>
          <div className="text-sm text-white/70">{date}</div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-4 backdrop-blur-lg">
          <div className="text-2xl font-bold text-blue-300">0</div>
          <div className="text-sm text-white/70">Active Meetings</div>
        </div>
        <div className="rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-4 backdrop-blur-lg">
          <div className="text-2xl font-bold text-purple-300">0</div>
          <div className="text-sm text-white/70">Scheduled</div>
        </div>
        <div className="rounded-2xl border border-green-400/30 bg-gradient-to-br from-green-500/20 to-green-600/20 p-4 backdrop-blur-lg">
          <div className="text-2xl font-bold text-green-300">0</div>
          <div className="text-sm text-white/70">Recordings</div>
        </div>
        <div className="rounded-2xl border border-pink-400/30 bg-gradient-to-br from-pink-500/20 to-pink-600/20 p-4 backdrop-blur-lg">
          <div className="text-2xl font-bold text-pink-300">24/7</div>
          <div className="text-sm text-white/70">Available</div>
        </div>
      </div>

      {/* Meeting Actions */}
      <div>
        <h2 className="mb-6 text-2xl font-bold text-white">
          Meeting Actions
        </h2>
        <MeetingTypeList />
      </div>

      {/* Quick Navigation */}
      <div className="mt-8">
        <h3 className="mb-4 text-xl font-semibold text-white">Quick Access</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <QuickNavCard
            img="/icons/upcoming.svg"
            title="Upcoming Meetings"
            description="View your scheduled meetings"
            href="/upcoming"
            count={0}
            className="border-blue-400/30 bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg"
          />
          <QuickNavCard
            img="/icons/recordings.svg"
            title="Meeting Recordings"
            description="Access recorded sessions"
            href="/recordings"
            count={0}
            className="border-purple-400/30 bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg"
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-8">
        <h3 className="mb-4 text-xl font-semibold text-white">Platform Features</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
            <div className="mb-2 text-xl text-blue-400">🔒</div>
            <h4 className="mb-1 font-semibold text-white">Secure & Private</h4>
            <p className="text-sm text-white/70">End-to-end encryption for all meetings</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
            <div className="mb-2 text-xl text-green-400">🎥</div>
            <h4 className="mb-1 font-semibold text-white">HD Video Quality</h4>
            <p className="text-sm text-white/70">Crystal clear video and audio</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
            <div className="mb-2 text-xl text-purple-400">📱</div>
            <h4 className="mb-1 font-semibold text-white">Cross Platform</h4>
            <p className="text-sm text-white/70">Works on all devices seamlessly</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
