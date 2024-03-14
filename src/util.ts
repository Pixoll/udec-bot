export function stripIndent(text: string): string {
    return text.trim().replace(/^[ \t]+/gm, '');
}
