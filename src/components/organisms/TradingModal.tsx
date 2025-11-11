"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Badge } from "@/components/atoms/Badge";
import type { NewPairToken } from "@/types/token";
import { formatNumber, formatPercent } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface TradingModalProps {
    token: NewPairToken | null;
    isOpen: boolean;
    onClose: () => void;
}

export const TradingModal = ({ token, isOpen, onClose }: TradingModalProps) => {
    const [amount, setAmount] = React.useState("");
    const [tradeType, setTradeType] = React.useState<"buy" | "sell">("buy");

    const handleTrade = () => {
        // Placeholder for actual trading logic
        alert(`${tradeType.toUpperCase()} ${amount} ${token?.symbol ?? ""}`);
        onClose();
    };

    if (!token) return null;

    const isPositive = token.change24h > 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <img src={token.iconUrl ?? "/vercel.svg"} alt={token.symbol} className="h-8 w-8 rounded-full" />
                        <div className="flex flex-col">
                            <span>{token.name}</span>
                            <span className="text-sm font-normal text-muted-foreground">{token.symbol}</span>
                        </div>
                        <Badge variant={isPositive ? "default" : "destructive"} className="ml-auto">
                            {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                            {formatPercent(token.change24h / 100)}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Current Price: ${formatNumber(token.priceUsd, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex gap-2">
                        <Button
                            variant={tradeType === "buy" ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => setTradeType("buy")}
                        >
                            Buy
                        </Button>
                        <Button
                            variant={tradeType === "sell" ? "destructive" : "outline"}
                            className="flex-1"
                            onClick={() => setTradeType("sell")}
                        >
                            Sell
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount" required>
                            Amount
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            endAddon={<span className="text-xs">{token.symbol}</span>}
                        />
                    </div>

                    <div className="rounded-md bg-muted p-3 space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Volume 24h:</span>
                            <span className="font-medium">${formatNumber(token.volume24h)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Liquidity:</span>
                            <span className="font-medium">${formatNumber(token.liquidity)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Protocol:</span>
                            <span className="font-medium capitalize">{token.protocol}</span>
                        </div>
                    </div>

                    <Button className="w-full" onClick={handleTrade} disabled={!amount || parseFloat(amount) <= 0}>
                        {tradeType === "buy" ? "Buy" : "Sell"} {token.symbol}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
