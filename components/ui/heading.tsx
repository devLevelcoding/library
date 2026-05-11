import React from "react"

interface HeadingProps {
    title: string
    description: string
}

export const Heading: React.FC<HeadingProps> = ({
    title,
    description
}) => {
    return <div className="mb-4">
        <h2 className="text-3xl font-bold tracking-thight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
    </div>
}