export const handleJsonParse = (data: string | null) => {

    try {
        return data ? JSON.parse(data) : null;
    } catch (err) {
        return data;
    }
}

export const handleJsonStringify = (data: string | null) => {
    try {
        return data ? (typeof data === 'string' ? data : JSON.stringify(data)) : null;
    } catch (err) {
        return data;
    }
}