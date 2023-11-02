import React, { useEffect, useState } from "react";

export const LoadingPage: React.FC = () => {
    const [show, setShow] = useState(false)
    useEffect(() => {
        const interval = setTimeout(() => setShow(true), 300)
        return () => {
            clearInterval(interval)
        }
    }, [])

    if (show) return <div>Loading...</div>

    return <></>
}