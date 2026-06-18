export type Guest = {
    name: string;
    tag: string;
}

export type onUnlockFn = (guest: Guest) => void
