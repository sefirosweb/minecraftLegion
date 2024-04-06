import React, { useContext, useState } from "react";
import axios from "axios";
import toastr from 'toastr'
import { BotSelectedContext } from "./ConfigurationContext";
import { Button } from "react-bootstrap";


export const SaveButton: React.FC = () => {
    const { bot, botConfig } = useContext(BotSelectedContext);
    const [loading, setLoading] = useState(false)

    const handleSaveButton = () => {
        setLoading(true)
        axios
            .post(`/api/save_bot_config/${bot.socketId}`, { botConfig })
            .then(() => {
                toastr.success('Config saved')
            })
            .catch((error) => {
                toastr.error('Error saving config')
            })
            .finally(() => {
                setLoading(false)
            })
    }

    return (
        <Button onClick={handleSaveButton} variant='success' className="mb-1" disabled={loading}>
            Save
        </Button>
    );
};