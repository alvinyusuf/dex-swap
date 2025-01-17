import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TokenAddresses, useAllTokens, useTokenInfo } from "@/web3/hooks/token-factory/useTokenRead";
import { TokenInfo } from "@/web3/contracts/token-factory";

export function SelectTokens() {
  const { data: tokenAddresses, isLoading, error }: { data: TokenAddresses | undefined; isLoading: boolean; error: Error | null } = useAllTokens();

  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select a Token" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Token</SelectLabel>
          {!isLoading && !error && tokenAddresses && tokenAddresses.map((address, index) => (
            <TokenItem key={index} tokenAddress={address} />
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

const TokenItem: React.FC<{ tokenAddress: `0x${string}` }> = ({ tokenAddress }) => {
  const { data: tokenInfo, isLoading, error }: { data: TokenInfo | undefined; isLoading: boolean; error: Error | null } = useTokenInfo(tokenAddress);

  if (isLoading) return <li>Loading...</li>;
  if (error) return <li>Error: {error.message}</li>;
  if (!tokenInfo) return <li>No token found</li>;

  return (
    <SelectItem value={tokenAddress}>{tokenInfo.name} - {tokenInfo.symbol}</SelectItem>
  )

}