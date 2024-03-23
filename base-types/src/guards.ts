import { DepositType } from "./types";

export const isDepositType = (value: any): value is DepositType => {
    return value === 'withdraw' || value === 'deposit' || value === 'depositAll';
}
