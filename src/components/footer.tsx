
"use client";
import { useState, useEffect } from 'react';

export default function Footer() {
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    return (
        <footer className="py-4 border-t bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
                <p>&copy; {year} Prospector AI. All rights reserved.</p>
            </div>
        </footer>
    );
}
