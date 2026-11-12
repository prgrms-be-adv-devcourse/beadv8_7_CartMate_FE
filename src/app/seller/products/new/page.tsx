import type { Metadata } from 'next';
import { Heading, Text } from '@astryxdesign/core';
import SalesPostRegisterForm from './_components/SalesPostRegisterForm';

export const metadata: Metadata = { title: '판매글 등록 및 수정 | TEAMBUY' };

export default function SellerProductNewPage() {
    return (
        <div className="flex flex-col w-full max-w-7xl mx-auto px-space-xl py-space-xl space-y-space-xl">
            <div className="flex flex-col space-y-space-xs">
                <Text color="secondary">SELLER CENTER / PRODUCT MANAGEMENT</Text>
                <Heading level={1}>판매글 등록 및 수정</Heading>
            </div>
            <SalesPostRegisterForm />
        </div>
    );
}
