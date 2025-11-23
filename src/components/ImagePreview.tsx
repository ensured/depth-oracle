"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";

interface ImagePreviewProps {
    src: string;
    alt: string;
    width: number;
    height: number;
}

export default function ImagePreview({ src, alt, width, height }: ImagePreviewProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div
                    className="cursor-pointer transition-transform"
                    onClick={() => setIsOpen(true)}

                >
                    <Image
                        src={src}
                        alt={alt}
                        width={width}
                        height={height}
                        className="rounded-lg shadow-lg hover:scale-105"
                    />
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-transparent border-none shadow-none flex items-center justify-center focus:outline-none">
                <DialogTitle className="sr-only">{alt}</DialogTitle>
                <div className="relative w-full h-full flex items-center justify-center outline-none" onClick={() => setIsOpen(false)}>
                    <Image
                        src={src}
                        alt={alt}
                        width={1600}
                        height={1600}
                        className="object-contain max-w-[90vw] max-h-[90vh] rounded-lg"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
