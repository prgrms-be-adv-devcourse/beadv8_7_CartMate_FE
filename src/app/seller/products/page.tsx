import type { Metadata } from 'next';
import { Button, Card, Heading, Text } from '@astryxdesign/core';
import { ROUTES } from '@/lib/routes';

export const metadata: Metadata = { title: '판매글 관리 | TEAMBUY' };

export default function SellerProductsPage() {
    return (
        <div className="flex flex-col w-full gap-space-xl">
            <div className="flex flex-wrap items-center justify-between gap-space-md">
                <div className="space-y-space-xs">
                    <Heading level={1}>판매글 관리</Heading>
                    <Text color="secondary">등록한 판매글을 확인하고 관리합니다.</Text>
                </div>
                <Button label="판매글 등록" href={ROUTES.sellerProductNew} />
            </div>

            <Card className="flex flex-col gap-space-lg" padding={6}>
                <div className="flex flex-col items-center gap-space-sm py-space-xl text-center" role="status">
                    <Heading level={2}>판매글 목록 기능 준비 중</Heading>
                    <Text color="secondary">판매자 본인의 판매글을 조회하는 기능이 준비되면 이곳에서 목록을 확인할 수 있습니다.</Text>
                    <Button label="판매글 등록" href={ROUTES.sellerProductNew} />
                </div>
            </Card>
        </div>
    );
}
