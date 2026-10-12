import type { Metadata } from 'next';
import AddressBook from './_components/AddressBook';

export const metadata: Metadata = {
    title: '배송지 관리 | TEAMBUY',
};

export default function AddressesPage() {
    return <AddressBook />;
}
