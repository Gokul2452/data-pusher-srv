function createDestinationDto(data) {
    if (!data?.account_id) throw new Error('Account ID is required');
    if (!data?.url) throw new Error('URL is required');
    if (!data?.http_method) throw new Error('HTTP method is required');
    if (!data?.headers) throw new Error('Headers are required');

    return {
        account_id: data.account_id,
        url: data.url,
        http_method: data.http_method.toUpperCase(),
        headers: data.headers,
    };
}

module.exports = { createDestinationDto };
