"use client";

import axios from "axios";
import { useState } from "react";
import { Edit, Eye, EyeOff, MoreHorizontal, Trash } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { AlertModal } from "@/components/modals/alert-modal";

import { CategoryColumn } from "./columns";

interface CellActionProps {
  data: CategoryColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onToggle = async () => {
    try {
      setLoading(true);
      await axios.patch(`/api/admin/categories/${data.id}`, { enabled: !data.enabled });
      toast.success(data.enabled ? 'Category hidden.' : 'Category visible.');
      router.refresh();
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const onConfirm = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/admin/categories/${data.id}`);
      toast.success('Category deleted.');
      router.refresh();
    } catch {
      toast.error('Make sure you removed all products using this category first.');
    } finally {
      setOpen(false);
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={loading}
          onClick={onToggle}
          title={data.enabled ? 'Hide category' : 'Show category'}
        >
          {data.enabled
            ? <Eye className="h-4 w-4 text-green-600" />
            : <EyeOff className="h-4 w-4 text-gray-400" />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/admin/categories/${data.id}`)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpen(true)} className="text-red-600">
              <Trash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};