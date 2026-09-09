const API_URL = "https://6a90168dff2484963a5db61a.mockapi.io/activity-logs";

export const logActivity = async (actionType, details, actorName = "System") => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const time = now.toLocaleTimeString(); 

    const formattedTimestamp = `${day}/${month}/${year}, ${time}`;

    const newLog = {
        timestamp: formattedTimestamp,
        actor: actorName,
        action: actionType,
        details: details
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newLog),
        });

        if (!response.ok) {
            throw new Error("Failed to save activity log to cloud");
        }

        // Notify open tabs/components to refresh logs
        window.dispatchEvent(new Event("activityLogsUpdated"));
    } catch (error) {
        console.error("Error logging activity:", error);
    }
};