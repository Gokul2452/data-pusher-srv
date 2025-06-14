function createLogDto(data) {
    if (!data.event_id || !data.account_id || !data.destination_id || !data.received_timestamp || !data.received_data || !data.status) {
        throw new Error("Missing required fields.");
    }

    return {
        event_id: data.event_id,
        account_id: data.account_id,
        destination_id: data.destination_id,
        received_timestamp: new Date(data.received_timestamp),
        processed_timestamp: data.processed_timestamp ? new Date(data.processed_timestamp) : null,
        received_data: data.received_data,
        status: data.status
    };
}

module.exports = { createLogDto };
