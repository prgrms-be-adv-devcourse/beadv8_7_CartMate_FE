import type { Metadata } from 'next';
import MyGroupPurchaseList from '../_components/MyGroupPurchaseList';

export const metadata: Metadata = {
    title: '내 공동구매 | TEAMBUY',
};

export default function GroupPurchasesPage() {
    return <MyGroupPurchaseList />;
}
