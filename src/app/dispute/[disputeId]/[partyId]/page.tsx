"use client";
import * as React from "react";
import { Copy, Truck } from "lucide-react";
import { format, formatDate, formatRelative } from "date-fns";
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import Link from "next/link";
import { api } from "~/trpc/react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Input } from "~/components/ui/input";
import {
  RoomProvider,
  useBroadcastEvent,
  useEventListener,
} from "liveblocks.config";

const parties = {
  partyA: "partyA",
  partyB: "partyB",
} as const;

function DisputePage({
  params,
}: {
  params: { disputeId: string; partyId: string };
}) {
  const broadcast = useBroadcastEvent();
  const { disputeId, partyId } = params;
  const utils = api.useUtils();
  const router = useRouter();
  const [bidAmount, setBidAmount] = React.useState<number>(0);

  const disputeQuery = api.getDispute.useQuery({
    disputeId: z.coerce.number().parse(disputeId),
  });
  const placeBidMutation = api.placeBid.useMutation({
    onSuccess: () => {
      void utils.invalidate();
      broadcast({ type: "BID_PLACED" });
    },
    onError: (error) => toast.error(error.message),
  });
  const acceptBidMutation = api.acceptBid.useMutation({
    onSuccess: () => {
      void utils.invalidate();
      broadcast({ type: "BID_ACCEPTED" });
    },
    onError: (error) => toast.error(error.message),
  });
  const rejectBidMutation = api.rejectBid.useMutation({
    onSuccess: () => {
      void utils.invalidate();
      broadcast({ type: "BID_REJECTED" });
    },
    onError: (error) => toast.error(error.message),
  });

  const isPartyA = partyId === parties.partyA;
  const lastBid = disputeQuery.data?.bids[0];

  React.useEffect(
    function redirectIfwrongPartyId() {
      if (!isPartyA && partyId !== parties.partyB) {
        router.push(`/dispute/${disputeId}/${parties.partyA}`);
      }
    },
    [disputeId, isPartyA, partyId, router],
  );

  useEventListener(({ event }) => {
    if (isPartyA) {
      if (event.type === "BID_ACCEPTED") {
        toast("Congratulations 🎉", {
          description: "Party B just accepted your bid",
          action: {
            label: "Refresh",
            onClick: () => {
              void utils.invalidate();
            },
          },
        });
      } else if (event.type === "BID_REJECTED") {
        toast("Bid rejected", {
          description: "Party B just rejected your bid",
          action: {
            label: "Refresh",
            onClick: () => {
              void utils.invalidate();
            },
          },
        });
      }
    } else {
      if (event.type === "BID_PLACED") {
        void utils.invalidate();
        toast("Party A just placed a new bid", {
          description:
            "The new bid is now available for you to accept or reject",
        });
      }
    }
  });

  return (
    <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 sm:pt-14">
      <main className="container grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3 ">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            <Card
              className="md:col-span-2 lg:col-span-1 xl:col-span-2"
              x-chunk="dashboard-05-chunk-0"
            >
              <CardHeader className="pb-3">
                <CardTitle>
                  Your Disputes as Party{" "}
                  {partyId === parties.partyA ? "A" : "B"}
                </CardTitle>
                <CardDescription className="max-w-lg text-balance leading-relaxed">
                  Introducing Our Dynamic Disputes Dashboard for Seamless
                  Management and Insightful Analysis.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild>
                  <Link
                    href={`/dispute/${disputeId}/${partyId === parties.partyA ? parties.partyB : parties.partyA}`}
                  >
                    Open {partyId === parties.partyA ? "Party B" : "Party A"}{" "}
                    view
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            <Card x-chunk="dashboard-05-chunk-2">
              <CardHeader className="pb-2">
                <CardDescription>This Month Disputes</CardDescription>
                <CardTitle className="text-4xl">$5,329</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Bids up +10% from last month
                </div>
              </CardContent>
            </Card>
          </div>
          <Card x-chunk="dashboard-05-chunk-3">
            <CardHeader className="px-7">
              <CardTitle>Bids</CardTitle>
              <CardDescription>Recent bids from your store.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Id</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {disputeQuery.data?.bids.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="pt-8 text-center">
                        No bids yet
                      </TableCell>
                    </TableRow>
                  )}
                  {disputeQuery.data?.bids.map((bid) => (
                    <TableRow
                      key={bid.id}
                      className="transition-colors hover:bg-accent"
                    >
                      <TableCell>
                        <div className="hidden text-sm text-muted-foreground md:inline">
                          {bid.id}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        Bid
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          className="text-xs capitalize"
                          variant="secondary"
                        >
                          {bid.state}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(new Date(bid.createdAt), "yyyy-MM-dd")}
                      </TableCell>
                      <TableCell className="text-right">
                        {dollarFormatter.format(bid.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
            <CardHeader className="flex flex-row items-start bg-muted/50">
              <div className="grid gap-0.5">
                <CardTitle className="group flex items-center gap-2 text-lg">
                  Dispute {disputeId}
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Copy className="h-3 w-3" />
                    <span className="sr-only">Copy Dispute ID</span>
                  </Button>
                </CardTitle>
                <CardDescription>
                  Date:{" "}
                  {format(
                    new Date(),
                    "MMMM dd, yyyy", // "MMMM dd, yyyy"
                  )}
                </CardDescription>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <Button size="sm" variant="outline" className="h-8 gap-1">
                  <Truck className="h-3.5 w-3.5" />
                  <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                    Track Dispute
                  </span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 text-sm">
              <div className="grid gap-3">
                <div className="font-semibold">Current Bid Details</div>
                {lastBid ? (
                  <ul className="grid gap-3">
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Bid at</span>
                      <span>
                        {formatRelative(
                          new Date(lastBid.createdAt),
                          new Date(),
                        )}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total</span>
                      <span>{dollarFormatter.format(lastBid.amount)}</span>
                    </li>
                    <li className="flex items-center justify-between font-semibold">
                      <span className="text-muted-foreground">State</span>
                      <span>{lastBid.state}</span>
                    </li>
                  </ul>
                ) : (
                  <div className="text-muted-foreground">No bids yet</div>
                )}
                {isPartyA ? (
                  (function () {
                    if (lastBid?.state !== "settled") {
                      return (
                        <>
                          <Input
                            value={bidAmount}
                            onChange={(e) => {
                              try {
                                setBidAmount(
                                  z.coerce.number().parse(e.target.value),
                                );
                              } catch (error) {
                                setBidAmount(0);
                              }
                            }}
                          />
                          <div>
                            <Button
                              onClick={() => {
                                placeBidMutation.mutate({
                                  amount: bidAmount,
                                  disputeId: disputeQuery.data!.id,
                                });
                              }}
                            >
                              Place Bid
                            </Button>
                          </div>
                        </>
                      );
                    }
                  })()
                ) : (
                  <div className="mt-4 flex justify-between">
                    <Button
                      variant={"outline"}
                      disabled={lastBid?.state !== "pending"}
                      onClick={() => {
                        lastBid &&
                          rejectBidMutation.mutate({
                            bidId: lastBid.id,
                          });
                      }}
                    >
                      Reject bid
                    </Button>
                    <Button
                      disabled={lastBid?.state !== "pending"}
                      onClick={() => {
                        lastBid &&
                          acceptBidMutation.mutate({
                            bidId: lastBid.id,
                          });
                      }}
                    >
                      Accept bid
                    </Button>
                  </div>
                )}
                {lastBid?.state === "settled" && (
                  <div className="text-muted-foreground">
                    Dispute settled 🥳 🙌
                  </div>
                )}
                <Separator className="my-2" />
              </div>
            </CardContent>
            <CardFooter className="bdispute-t flex flex-row items-center bg-muted/50 px-6 py-3">
              <div className="text-xs text-muted-foreground">
                Updated{" "}
                <time dateTime="2023-11-23">
                  {" "}
                  {format(
                    lastBid ? new Date(lastBid?.createdAt) : new Date(),
                    "MMMM dd, yyyy",
                  )}
                </time>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function DisputePageWithRoom({
  params,
}: {
  params: { disputeId: string; partyId: string };
}) {
  const { disputeId, partyId } = params;
  return (
    <RoomProvider id={`dispute-${disputeId}`} initialPresence={{}}>
      <DisputePage params={{ disputeId, partyId }} />
    </RoomProvider>
  );
}

const dollarFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
