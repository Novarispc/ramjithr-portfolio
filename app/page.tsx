import { getPageData } from '@/lib/public-data'
import ClientHome from '@/components/layout/ClientHome'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  const data = await getPageData()
  return <ClientHome data={data} />
}
