"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";

import { columns, ProductColumn } from "./columns";
import { Heading } from "@/components/ui/heading";

interface ProductClientProps {
  data: ProductColumn[];
}

export const ProductClient: React.FC<ProductClientProps> = ({
  data
}) => {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
            <Heading 
                title="Products"
                description="Shop Products"
            />
            <Button onClick={() => router.push(`/admin/products/new`)}>
                <Plus className="mr-2 h-4 w-4" /> Add New
            </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
    </>
  );
};