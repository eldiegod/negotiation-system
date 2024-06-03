"use client";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/trpc/react";

export default function HomePage() {
  const router = useRouter();
  const createDisputeMutation = api.createDispute.useMutation({
    onSuccess: (data) => {
      router.push(`/dispute/${data.id}/partyA`);
    },
  });

  return (
    <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 sm:pt-14">
      <main className="container mt-20 flex items-start justify-center p-4 sm:px-6 sm:py-0">
        <Card
          className="md:col-span-2 lg:col-span-1 xl:col-span-2"
          x-chunk="dashboard-05-chunk-0"
        >
          <CardHeader className="pb-3">
            <CardTitle>Your Disputes</CardTitle>
            <CardDescription className="max-w-lg text-balance leading-relaxed">
              Introducing Our Dynamic Disputes Dashboard for Seamless Management
              and Insightful Analysis.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => createDisputeMutation.mutate()}>
              Create New Dispute
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
