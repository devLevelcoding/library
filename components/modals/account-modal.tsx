"use client"

import React, { useEffect, useState } from "react"
import { Modal } from "../ui/modal"
import { Button } from "../ui/button"

interface AccountModalProps {
    isOpen: boolean
    loading: boolean
    onClose: () => void
    onConfirm: () => void
}

export const AccountModal: React.FC<AccountModalProps> = ({
    isOpen,
    loading,
    onClose,
    onConfirm
}) => {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    return (
        <Modal
            title="Please crearte an account"
            description="In order to continue the checkout process please create an account"
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                <Button disabled={loading} variant='outline' onClick={onClose}>
                    Cancel
                </Button>
                <Button disabled={loading} variant='destructive' onClick={onConfirm}>
                    Sign Up
                </Button>
            </div>
        </Modal>
    )
}