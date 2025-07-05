import MeetingTypeList from '@/components/MeetingTypeList';
import QuickNavCard from '@/components/QuickNavCard';

const Dashboard = () => {
  const now = new Date();

  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const date = (new Intl.DateTimeFormat('en-US', { dateStyle: 'full' })).format(now);

  return (
    <section className="flex size-full flex-col gap-10 text-white">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Welcome to Nexus Meet
          </h1>
          <p className="text-lg text-white/80">
            Professional video conferencing platform for seamless collaboration
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl lg:text-4xl font-bold text-white mb-1">{time}</div>
          <div className="text-sm text-white/70">{date}</div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg border border-blue-400/30 rounded-2xl p-4">
          <div className="text-2xl font-bold text-blue-300">0</div>
          <div className="text-sm text-white/70">Active Meetings</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg border border-purple-400/30 rounded-2xl p-4">
          <div className="text-2xl font-bold text-purple-300">0</div>
          <div className="text-sm text-white/70">Scheduled</div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg border border-green-400/30 rounded-2xl p-4">
          <div className="text-2xl font-bold text-green-300">0</div>
          <div className="text-sm text-white/70">Recordings</div>
        </div>
        <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-lg border border-pink-400/30 rounded-2xl p-4">
          <div className="text-2xl font-bold text-pink-300">24/7</div>
          <div className="text-sm text-white/70">Available</div>
        </div>
      </div>

      {/* Meeting Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-white">
          Meeting Actions
        </h2>
        <MeetingTypeList />
      </div>

      {/* Quick Navigation */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 text-white">Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickNavCard
            img="/icons/upcoming.svg"
            title="Upcoming Meetings"
            description="View your scheduled meetings"
            href="/upcoming"
            count={0}
            className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg border-blue-400/30"
          />
          <QuickNavCard
            img="/icons/recordings.svg"
            title="Meeting Recordings"
            description="Access recorded sessions"
            href="/recordings"
            count={0}
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg border-purple-400/30"
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 text-white">Platform Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
            <div className="text-blue-400 text-xl mb-2">🔒</div>
            <h4 className="font-semibold text-white mb-1">Secure & Private</h4>
            <p className="text-sm text-white/70">End-to-end encryption for all meetings</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
            <div className="text-green-400 text-xl mb-2">🎥</div>
            <h4 className="font-semibold text-white mb-1">HD Video Quality</h4>
            <p className="text-sm text-white/70">Crystal clear video and audio</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
            <div className="text-purple-400 text-xl mb-2">📱</div>
            <h4 className="font-semibold text-white mb-1">Cross Platform</h4>
            <p className="text-sm text-white/70">Works on all devices seamlessly</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
