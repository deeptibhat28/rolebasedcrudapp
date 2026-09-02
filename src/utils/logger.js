export const logActivity = (actionType, details, actorName = "System") => {
    const newLog = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        actor: actorName,
        action: actionType,
        details: details
    };

    const exisingLogs = JSON.parse(localStorage.getItem("admin_activity_logs")) || [];
    const updatedLogs = [newLog, ...exisingLogs];
    localStorage.setItem("admin_activity_logs", JSON.stringify(updatedLogs));
};