"use client";

import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";

import { columns, OrderColumn } from "./columns";
import { Heading } from "@/components/ui/heading";

interface OrderClientProps {
  data: OrderColumn[];
}

export const OrderClient: React.FC<OrderClientProps> = ({
  data
}) => {
  return (
    <>
      <Heading 
          title="My Orders"
          description="Your orders list"
      />
      <Separator />
      <DataTable searchKey="user" columns={columns} data={data} />
    </>
  );
};