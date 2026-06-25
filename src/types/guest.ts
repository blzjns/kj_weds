export enum Role {
    Guest = 1,
    Admin = 2,
}

export type Guest = {
    id?: number;
    code?: string;
    name: string;
    role: Role;
    created_at?: Date;
    sessionId: string;
}

export type GuestInput = Omit<Guest, 'id' | 'code' | 'created_at'>;

export type onUnlockFn = (guest: Guest) => void
