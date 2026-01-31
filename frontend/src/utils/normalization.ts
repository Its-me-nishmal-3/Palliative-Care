export const normalizeWardName = (name: string): string => {
    if (!name) return name;
    // Normalize "നാട്ടുക്കൽ" to "നാട്ടുകൽ"
    if (name === 'നാട്ടുക്കൽ') return 'നാട്ടുകൽ';
    return name;
};
