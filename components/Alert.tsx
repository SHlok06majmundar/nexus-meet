import Link from 'next/link';
import Image from 'next/image';

import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface PermissionCardProps {
  title: string;
  iconUrl?: string;
}

const Alert = ({ title, iconUrl }: PermissionCardProps) => {
  return (
    <section className="flex-center h-screen w-full bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-6">
      <Card className="w-full max-w-[600px] border border-white/20 bg-gradient-to-br from-dark-1/90 to-dark-2/90 backdrop-blur-lg p-8 py-12 text-white rounded-3xl shadow-2xl">
        <CardContent>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6 text-center">
              {iconUrl && (
                <div className="flex-center">
                  <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 p-6 rounded-full border border-orange-400/30">
                    <Image src={iconUrl} width={72} height={72} alt="icon" className="filter brightness-110" />
                  </div>
                </div>
              )}
              <div>
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-3">
                  Meeting Status
                </p>
                <p className="text-lg font-medium text-white/90 leading-relaxed max-w-md mx-auto">
                  {title}
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                asChild 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-blue-400/50"
              >
                <Link href="/">
                  <span className="flex items-center gap-3">
                    🏠 Back to Home
                  </span>
                </Link>
              </Button>
            </div>

            <div className="text-center">
              <p className="text-white/60 text-sm">
                Return to the dashboard to schedule or join other meetings
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default Alert;
