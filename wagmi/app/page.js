'use client';
import { useReadContract } from "wagmi";
import { abi } from './abi';
import { mainnet } from 'wagmi/chains';

export default function Home() {

  const { data: balance } = useReadContract({
    abi,
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    functionName: 'balanceOf',
    args: ['0x6B175474E89094C44Da98b954EedeAC495271d0F'],
    chainId: 1,
  })

  return (
    <p>BalanceOf on the mainnet : {balance && balance.toString()}</p>
  );
}
