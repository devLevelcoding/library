"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"

export type CategoryColumn = {
  id: string
  name: string
  parent: string
  enabled: boolean
  createdAt: string
}

export const columns: ColumnDef<CategoryColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "parent",
    header: "Parent",
    cell: ({ row }) => row.original.parent || <span className="text-gray-400 text-xs">— top level —</span>,
  },
  {
    accessorKey: "enabled",
    header: "Visible",
    cell: ({ row }) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        row.original.enabled
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-500"
      }`}>
        {row.original.enabled ? "Visible" : "Hidden"}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
]
