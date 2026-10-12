'use client';

export default function ClaimActions() {
    return (
        <>
            <button className="bg-surface border border-outline-variant text-on-surface text-caption px-space-md py-1 rounded hover:bg-surface-container font-label-sm transition-all" type="button" onClick={() => alert('수락 처리되었습니다.')}>
                수락
            </button>
            <button className="bg-primary text-on-primary text-caption px-space-md py-1 rounded hover:opacity-90 font-label-sm transition-all" type="button" onClick={() => alert('완료 처리되었습니다.')}>
                완료 처리
            </button>
        </>
    );
}
