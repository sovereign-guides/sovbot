export default function contentExistenceCheck(messageContent: string | undefined): string {
    if (messageContent && messageContent?.length > 0) {
        return <string>messageContent;
    }
    else {
        return '⚠️ Message contained no text.';
    }
}
