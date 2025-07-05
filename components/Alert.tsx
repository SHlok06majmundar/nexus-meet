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
      <Card className="w-full max-w-[600px] rounded-3xl border border-white/20 bg-gradient-to-br from-dark-1/90 to-dark-2/90 p-8 py-12 text-white shadow-2xl backdrop-blur-lg">
        <CardContent>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6 text-center">
              {iconUrl && (
                <div className="flex-center">
                  <div className="rounded-full border border-orange-400/30 bg-gradient-to-br from-orange-500/20 to-red-500/20 p-6">
                    <Image src={iconUrl} width={72} height={72} alt="icon" className="brightness-110" />
                  </div>
                </div>
              )}
              <div>
                <p className="mb-3 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
                  Meeting Status
                </p>
                <p className="mx-auto max-w-md text-lg font-medium leading-relaxed text-white/90">
                  {title}
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                asChild 
                className="rounded-2xl border border-blue-400/50 bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-purple-700 hover:shadow-2xl"
              >
                <Link href="/">
                  <span className="flex items-center gap-3">
                    🏠 Back to Home
                  </span>
                </Link>
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-white/60">
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
