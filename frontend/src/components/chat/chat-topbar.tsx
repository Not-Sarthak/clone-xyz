"use client"

import React, { useEffect, useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sidebar } from "../sidebar"
import { Message } from "ai/react"
import useChatStore from "@/lib/hooks/use-chat-store"
import { useAppKitAccount } from "@reown/appkit/react"
import { toast } from "sonner"
import { ethers, Wallet } from "ethers"
import WalletDisplay from "./wallet-display"
import WalletActions from "./wallet-actions"
import { CaretSortIcon, HamburgerMenuIcon } from "@radix-ui/react-icons"
import { CheckIcon, CopyIcon, Loader2 } from "lucide-react"

type NetworkConfig = {
  rpcUrl: string | undefined
  scanApiUrl: string
  scanApiKey: string | undefined
  nativeSymbol: string
  chainId: number
}

const NETWORKS: Record<string, NetworkConfig> = {
  sepolia: {
    rpcUrl: process.env.ETH_SEPOLIA_RPC,
    scanApiUrl: "https://api-sepolia.etherscan.io/api",
    scanApiKey: process.env.NEXT_PUBLIC_ETHSCAN,
    nativeSymbol: "SepoliaETH",
    chainId: 11155111,
  },
  "base-sepolia": {
    rpcUrl: process.env.BASE_SEPOLIA_RPC,
    scanApiUrl: "https://api-sepolia.basescan.org/api",
    scanApiKey: process.env.NEXT_PUBLIC_BASESCAN,
    nativeSymbol: "ETH",
    chainId: 84532,
  },
} as const

interface ChatTopbarProps {
  isLoading: boolean
  chatId?: string
  messages: Message[]
  setMessages: (messages: Message[]) => void
}

interface WalletDetails {
  publicKey: string
  privateKey: string
  seedPhrase: string
  createdAt: string
}

const truncateAddress = (address: string) => {
  if (!address) return ""
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export default function ChatTopbar({
  isLoading,
  chatId,
  messages,
  setMessages,
}: ChatTopbarProps) {
  const [open, setOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [walletSheetOpen, setWalletSheetOpen] = useState(false)
  const [walletDetails, setWalletDetails] = useState<WalletDetails | null>(null)
  const [isLoadingWallet, setIsLoadingWallet] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // const [showPrivateKey, setShowPrivateKey] = useState(false);
  // const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [copiedStates, setCopiedStates] = useState({
    publicKey: false,
    privateKey: false,
    seedPhrase: false,
  })

  const selectedNetwork = useChatStore((state) => state.selectedNetwork)
  const setSelectedNetwork = useChatStore((state) => state.setSelectedNetwork)

  const { address, isConnected } = useAppKitAccount()
  const networks = ["Sepolia", "Base Sepolia"]

  const handleNetworkChange = (network: string) => {
    setSelectedNetwork(network)
    setOpen(false)
  }

  const generateWallet = () => {
    const wallet = Wallet.createRandom()
    return {
      publicKey: wallet.address,
      privateKey: wallet.privateKey,
      seedPhrase: wallet.mnemonic?.phrase || "",
    }
  }

  const checkAndCreateWallet = async () => {
    setIsLoadingWallet(true)
    setError(null)

    try {
      // First try to fetch existing wallet
      const response = await fetch(`/api/wallet/${address}`)

      if (response.status === 404) {
        // Wallet not found, generate and create new one
        const newWallet = generateWallet()

        const createResponse = await fetch("/api/wallet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userAddress: address,
            ...newWallet,
          }),
        })

        if (!createResponse.ok) {
          throw new Error("Failed to create wallet")
        }

        toast.success("New wallet generated successfully!")
        // After creating, fetch the wallet details
        await fetchWalletDetails()
      } else if (response.ok) {
        const data = await response.json()
        setWalletDetails(data)
      } else {
        throw new Error("Failed to fetch wallet details")
      }
    } catch (error) {
      console.error("Wallet operation error:", error)
      setError("Failed to setup wallet. Please try again.")
      toast.error("Failed to setup wallet")
    } finally {
      setIsLoadingWallet(false)
    }
  }

  const fetchWalletDetails = async () => {
    try {
      const response = await fetch(`/api/wallet/${address}`)
      if (!response.ok) throw new Error("Failed to fetch wallet details")
      const data = await response.json()
      setWalletDetails(data)
    } catch (error) {
      console.error("Error fetching wallet:", error)
      setError("Failed to fetch wallet details")
    }
  }

  useEffect(() => {
    if (address && isConnected) {
      checkAndCreateWallet()
    }
  }, [address, isConnected])

  const handleCopy = async (text: string, field: keyof typeof copiedStates) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates((prev) => ({ ...prev, [field]: true }))
      setTimeout(
        () => setCopiedStates((prev) => ({ ...prev, [field]: false })),
        2000,
      )
      toast.success("Copied to clipboard")
    } catch {
      toast.error("Failed to copy")
    }
  }

  const handleSendTransaction = async (to: string, amount: string) => {
    try {
      const networkKey =
        selectedNetwork?.toLowerCase().replace(" ", "-") || "sepolia"
      const provider = new ethers.providers.JsonRpcProvider(
        NETWORKS[networkKey].rpcUrl,
      )
      const wallet = new ethers.Wallet(
        walletDetails?.privateKey || "",
        provider,
      )

      const tx = await wallet.sendTransaction({
        to,
        value: ethers.utils.parseEther(amount),
      })

      await tx.wait()
      toast.success("Transaction sent successfully!")
      return tx
    } catch (error) {
      console.error("Transaction error:", error)
      toast.error("Transaction failed")
      throw error
    }
  }

  return (
    <div className="flex w-full items-center justify-between space-x-4 px-4 py-6 lg:justify-center">
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger>
          <HamburgerMenuIcon className="h-5 w-5 lg:hidden" />
        </SheetTrigger>
        <SheetContent side="left">
          <Sidebar
            chatId={chatId || ""}
            isCollapsed={false}
            isMobile={false}
            messages={messages}
            closeSidebar={() => setSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Network Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            disabled={isLoading}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between capitalize"
          >
            {selectedNetwork || "Select Network"}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          {networks.map((network) => (
            <Button
              key={network}
              variant="ghost"
              className="w-full justify-start font-normal capitalize"
              onClick={() => handleNetworkChange(network)}
            >
              {network}
            </Button>
          ))}
        </PopoverContent>
      </Popover>

      {isConnected ? (
        <>
          <Sheet open={walletSheetOpen} onOpenChange={setWalletSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline">
                {walletDetails
                  ? truncateAddress(walletDetails.publicKey)
                  : "Loading..."}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Wallet Details</SheetTitle>
              </SheetHeader>

              {isLoadingWallet ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="text-primary h-8 w-8 animate-spin" />
                </div>
              ) : error ? (
                <div className="rounded-lg bg-red-50 p-4">
                  <p className="text-center text-red-600">{error}</p>
                </div>
              ) : walletDetails ? (
                <div className="mt-4 space-y-4">
                  {/* Public Key */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Public Key</label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={walletDetails.publicKey}
                        className="font-mono text-sm"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          handleCopy(walletDetails.publicKey, "publicKey")
                        }
                      >
                        {copiedStates.publicKey ? (
                          <CheckIcon className="h-4 w-4" />
                        ) : (
                          <CopyIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="text-muted-foreground text-sm">
                    Created:{" "}
                    {new Date(walletDetails.createdAt).toLocaleDateString()}
                  </div>

                  <WalletActions
                    address={walletDetails.publicKey}
                    onSend={handleSendTransaction}
                  />
                  <WalletDisplay address={walletDetails.publicKey} />
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-500">
                    Please connect your wallet to view details
                  </p>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </>
      ) : (
        <appkit-button />
      )}
    </div>
  )
}
