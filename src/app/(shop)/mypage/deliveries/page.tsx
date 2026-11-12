import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import MyPageShell from '@/components/layout/MyPageShell';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import DeliveryList from './_components/DeliveryList';

export const metadata: Metadata = {
    title: '배송 조회 | TEAMBUY',
};

export default function DeliveriesPage() {
    return (
        <MyPageShell title="배송 조회" description="판매자별 배송 진행 상황을 확인하고 구매를 확정합니다.">
                    <div className="flex flex-col gap-5">
                        <div className="flex gap-space-sm">
                            <Button label="주문 내역" variant="secondary" size="sm" href={ROUTES.orders} as={Link} />
                            <Button label="배송 조회" variant="primary" size="sm" isDisabled />
                        </div>

                        <DeliveryList />

                        <Card variant="muted" padding={4}>
                          <div className="flex items-start gap-3">
                            <Icon name="info" className="text-outline text-[20px] mt-0.5" />
                            <div className="flex flex-col gap-1">
                                <Text weight="semibold">배송 · 구매 확정 안내</Text>
                                <Text type="supporting" color="secondary">배송 요청 → 배송 준비 → 배송 중 → 배송 완료 순서로 진행됩니다.</Text>
                                <Text type="supporting" color="secondary">배송 완료 후 7일 안에 구매를 확정하거나 교환·환불을 신청할 수 있습니다.</Text>
                            </div>
                          </div>
                        </Card>
                    </div>
        </MyPageShell>
    );
}
