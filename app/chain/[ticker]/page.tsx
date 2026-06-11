import { ChainDashboard } from "@/components/ChainDashboard";

type PageProps = {
  params: Promise<{
    ticker: string;
  }>;
};

export default async function ChainPage({ params }: PageProps) {
  const { ticker } = await params;
  return <ChainDashboard ticker={ticker.toUpperCase()} />;
}
