export const logActivity = (actionType, details, actorName = "System") => {

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const time = now.toLocaleTimeString(); 

    const formattedTimestamp = `${day}/${month}/${year}, ${time}`;


    const newLog = {
        id: Date.now(),
        timestamp: formattedTimestamp,
        actor: actorName,
        action: actionType,
        details: details
    };

    const existingLogs = JSON.parse(localStorage.getItem("admin_activity_logs")) || [];
    const updatedLogs = [newLog, ...existingLogs];
    localStorage.setItem("admin_activity_logs", JSON.stringify(updatedLogs));

    window.dispatchEvent(new Event("activityLogsUpdated"));
};