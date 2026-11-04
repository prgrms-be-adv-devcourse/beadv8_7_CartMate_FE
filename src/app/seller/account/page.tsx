import type { Metadata } from 'next';
import SellerAccountContent from './_components/SellerAccountContent';

export const metadata: Metadata = { title: '판매자 정보 · 정산 계좌 | TEAMBUY' };

export default function SellerAccountPage() {
    return <SellerAccountContent />;
}