import type { Metadata } from 'next';
import MyList from '../../individual/_components/MyList';

export const metadata: Metadata = { title: '내 개인물품 공동구매 | TEAMBUY' };

export default function IndividualGroupPurchasesPage() {
    return <MyList />;
}
