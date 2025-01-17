'use client'

import { useAllTokens, useTokenInfo, TokenInfo, TokenAddresses } from "@/web3/hooks/token-factory/useTokenRead";
import { boolean } from "zod";

export default function TokenList() {
  const { data: tokenAddresses, isLoading, error }: { data: TokenAddresses | undefined; isLoading: boolean; error: Error | null } = useAllTokens();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!tokenAddresses) {
    return <div>No token found</div>;
  }

  return (
    <div>
      {tokenAddresses.map((address, index) => (
        <TokenItem key={index} tokenAddress={address} />
      ))}
    </div>
  );
}

const TokenItem: React.FC<{ tokenAddress: `0x${string}` }> = ({ tokenAddress }) => {
  const { data: tokenInfo, isLoading, error }: { data: TokenInfo | undefined; isLoading: boolean; error: Error | null } = useTokenInfo(tokenAddress);

  if (isLoading) return <li>Loading...</li>;
  if (error) return <li>Error: {error.message}</li>;
  if (!tokenInfo) return <li>No token found</li>;

  return (
    <li>
      {tokenInfo.name} ({tokenInfo.symbol}) - Pemilik: {tokenInfo.owner}
    </li>
  );
};