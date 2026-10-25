import './globals.css';import Loader from '@/components/Loader';
export const metadata={title:'High Flyers Academy'};
export default function L({children}){return <html lang="en"><body><a className="skip" href="#main">Skip to content</a><Loader/>{children}</body></html>}
