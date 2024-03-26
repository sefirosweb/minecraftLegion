import { Agro, DepositType, tunnelType } from "./types";

export const isDepositType = (value: any): value is DepositType => {
    return value === 'withdraw' || value === 'deposit' || value === 'depositAll';
}

export const isAgroType = (value: any): value is Agro => {
    return value === 'none' || value === 'pve' || value === 'pvp';
}

export const istunnel = (value: any): value is tunnelType => {
    return value === 'horizontally' || value === 'vertically';
}
